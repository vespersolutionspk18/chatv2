import { UserAvatar } from '@/components/common/UserAvatar'
import { useGetUser } from '@/hooks/useGetUser'
import { useFetchChannelList } from '@/utils/channel/ChannelListProvider'
import { UserListContext } from '@/utils/users/UserListProvider'
import { Command } from 'cmdk'
import { useContext } from 'react'
import DMChannelItem from './DMChannelItem'
import { useNavigate } from 'react-router-dom'
import { useSetAtom } from 'jotai'
import { commandMenuOpenAtom } from './CommandMenu'
import { useFrappePostCall } from 'frappe-react-sdk'
import { Flex } from '@radix-ui/themes'
import { Loader } from '@/components/common/Loader'
import { toast } from 'sonner'
import { getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'

const UserList = () => {

    const { dm_channels } = useFetchChannelList()

    const { users } = useContext(UserListContext)

    const usersWithoutChannels = users.filter((user) => !dm_channels.find((channel) => channel.peer_user_id === user.name))

    return (
        <Command.Group heading="Members">
            {dm_channels.map((channel) => <DMChannelItem key={channel.name} channelID={channel.name} peer_user_id={channel.peer_user_id} />)}
            {usersWithoutChannels.map((user) => <UserWithoutDMItem key={user.name} userID={user.name} />)}
        </Command.Group>
    )
}

const UserWithoutDMItem = ({ userID }: { userID: string }) => {

    const user = useGetUser(userID)
    const navigate = useNavigate()
    const setOpen = useSetAtom(commandMenuOpenAtom)
    const { call, loading } = useFrappePostCall<{ message: string }>('chatly.api.chatly_channel.create_direct_message_channel')

    const onSelect = () => {
        call({
            user_id: userID
        }).then((res) => {
            navigate(`/channel/${res?.message}`)
            setOpen(false)
        }).catch(err => {
            toast.error('Could not create a DM channel', {
                description: getErrorMessage(err)
            })
        })
    }

    return <Command.Item
        keywords={[user?.full_name ?? userID]}
        value={userID}
        onSelect={onSelect}>
        <Flex width='100%' justify={'between'} align='center'>
            <Flex gap='2' align='center'>
                <UserAvatar
                    src={user?.user_image}
                    isBot={user?.type === 'Bot'}
                    alt={user?.full_name ?? userID} />
                {user?.full_name}
            </Flex>
            {loading ? <Loader /> : null}
        </Flex>
    </Command.Item>
}

export default UserList