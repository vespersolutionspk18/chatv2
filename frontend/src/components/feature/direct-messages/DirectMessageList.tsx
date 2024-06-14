import { useFrappePostCall } from "frappe-react-sdk"
import { useContext, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { SidebarGroup, SidebarGroupItem, SidebarGroupLabel, SidebarGroupList, SidebarIcon, SidebarButtonItem } from "../../layout/Sidebar"
import { SidebarBadge, SidebarItem, SidebarViewMoreButton } from "../../layout/Sidebar/SidebarComp"
import { UserContext } from "../../../utils/auth/UserProvider"
import { useGetUser } from "@/hooks/useGetUser"
import { useIsUserActive } from "@/hooks/useIsUserActive"
import { ChannelListContext, ChannelListContextType, DMChannelListItem, UnreadCountData } from "../../../utils/channel/ChannelListProvider"
import { Box, Flex, Text } from "@radix-ui/themes"
import { UserAvatar } from "@/components/common/UserAvatar"
import { toast } from "sonner"
import { getErrorMessage } from "@/components/layout/AlertBanner/ErrorBanner"
import { useStickyState } from "@/hooks/useStickyState"
import clsx from "clsx"
import { UserFields, UserListContext } from "@/utils/users/UserListProvider"

export const DirectMessageList = ({ unread_count }: { unread_count?: UnreadCountData }) => {

    const { dm_channels } = useContext(ChannelListContext) as ChannelListContextType

    const [showData, setShowData] = useStickyState(true, 'expandDirectMessageList')

    const toggle = () => setShowData(d => !d)

    const ref = useRef<HTMLDivElement>(null)

    const [height, setHeight] = useState(ref?.current?.clientHeight ?? showData ? (dm_channels.length + (dm_channels.length < 5 ? 5 : 0)) * (34.79) : 0)

    useLayoutEffect(() => {
        setHeight(ref.current?.clientHeight ?? 0)
    }, [dm_channels])

    return (
        <SidebarGroup pb='4'>
            <SidebarGroupItem className={'gap-1 pl-1'}>
                <Flex width='100%' justify='between' align='center' gap='2' pr='2' className="group">
                    <Flex align='center' gap='2' width='100%' onClick={toggle} className="cursor-default select-none">
                        <SidebarGroupLabel className="pt-0.5">Members</SidebarGroupLabel>
                        <Box className={clsx('transition-opacity ease-in-out duration-200', !showData && unread_count && unread_count?.total_unread_count_in_dms > 0 ? 'opacity-100' : 'opacity-0')}>
                            <SidebarBadge>{unread_count?.total_unread_count_in_dms}</SidebarBadge>
                        </Box>
                    </Flex>
                    <SidebarViewMoreButton onClick={toggle} expanded={showData} />
                </Flex>
            </SidebarGroupItem>
            <SidebarGroup>
                <SidebarGroupList
                    style={{
                        height: showData ? height : 0
                    }}>
                    <div ref={ref} className="flex gap-1 flex-col fade-in">
                        <DirectMessageItemList unread_count={unread_count} />
                        {dm_channels.length < 5 ? <ExtraUsersItemList /> : null}
                    </div>
                </SidebarGroupList>
            </SidebarGroup>
        </SidebarGroup>
    )
}

const DirectMessageItemList = ({ unread_count }: { unread_count?: UnreadCountData }) => {
    const { dm_channels } = useContext(ChannelListContext) as ChannelListContextType

    return <>
        {dm_channels.map((channel) => <DirectMessageItem
            key={channel.name}
            channel={channel}
            unreadCount={unread_count?.channels ?? []}
        />)}
    </>
}

const DirectMessageItem = ({ channel, unreadCount }: { channel: DMChannelListItem, unreadCount: UnreadCountData['channels'] }) => {


    const unreadCountForChannel = useMemo(() => unreadCount.find((unread) => unread.name == channel.name)?.unread_count, [channel.name, unreadCount])

    return <DirectMessageItemElement channel={channel} unreadCount={unreadCountForChannel} />

}

export const DirectMessageItemElement = ({ channel, unreadCount }: { channel: DMChannelListItem, unreadCount?: number }) => {

    const { currentUser } = useContext(UserContext)
    const userData = useGetUser(channel.peer_user_id)
    const isActive = useIsUserActive(channel.peer_user_id)

    const { channelID } = useParams()

    const showUnread = unreadCount && channelID !== channel.name

    return <SidebarItem to={channel.name} className={'py-0.5 px-2'}>
        <SidebarIcon>
            <UserAvatar src={userData?.user_image}
                alt={userData?.full_name}
                isBot={userData?.type === 'Bot'}
                isActive={isActive}
                size={{
                    initial: '2',
                    md: '1'
                }}
                availabilityStatus={userData?.availability_status}
                 />
        </SidebarIcon>
        <Flex justify='between' width='100%'>
            <Text size={{
                initial: '3',
                md: '2'
            }} className="text-ellipsis line-clamp-1" weight={showUnread ? 'bold' : 'medium'}>
                {channel.peer_user_id !== currentUser ? userData?.full_name ?? channel.peer_user_id : `${userData?.full_name} (You)`}
            </Text>
            {showUnread ? <SidebarBadge>{unreadCount}</SidebarBadge> : null}
        </Flex>
    </SidebarItem>
}

const ExtraUsersItemList = () => {

    const { dm_channels, mutate } = useContext(ChannelListContext) as ChannelListContextType

    const { enabledUsers } = useContext(UserListContext)
    const { call } = useFrappePostCall<{ message: string }>("chatly.api.chatly_channel.create_direct_message_channel")

    const navigate = useNavigate()

    const createDMChannel = async (user_id: string) => {
        return call({ user_id })
            .then((r) => {
                navigate(`${r?.message}`)
                mutate()
            })
            .catch((e) => {
                toast.error('Could not create channel', {
                    description: getErrorMessage(e)
                })
            })
    }

    const filteredUsers = useMemo(() => {
        // Show only users who are not in the DM list
        return enabledUsers.filter((user) => !dm_channels.find((channel) => channel.peer_user_id === user.name)).slice(0, 5)
    }, [enabledUsers, dm_channels])

    return <>{filteredUsers.map((user) => <ExtraUsersItem
        key={user.name}
        user={user}
        createDMChannel={createDMChannel}
    />)}</>
}

const ExtraUsersItem = ({ user, createDMChannel }: { user: UserFields, createDMChannel: (user_id: string) => Promise<void> }) => {

    const [isLoading, setIsLoading] = useState(false)
    const { currentUser } = useContext(UserContext)

    const onButtonClick = () => {
        setIsLoading(true)
        createDMChannel(user.name)
            .finally(() => setIsLoading(false))
    }

    const isActive = useIsUserActive(user.name)
    return <SidebarButtonItem
        isLoading={isLoading}
        onClick={onButtonClick}>
        <SidebarIcon>
            <UserAvatar src={user.user_image} alt={user.full_name} isActive={isActive} isBot={user?.type === 'Bot'}
                size={{
                    initial: '2',
                    md: '1'
                }}
              availabilityStatus={user.availability_status}/>
        </SidebarIcon>
        <Flex justify='between' width='100%'>
            <Text size={{
                initial: '3',
                md: '2'
            }} className="text-ellipsis line-clamp-1" weight='medium'>
                {user.name !== currentUser ? user.full_name : `${user.full_name} (You)`}
            </Text>
        </Flex>
    </SidebarButtonItem>
}
