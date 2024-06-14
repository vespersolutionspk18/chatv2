import { useContext, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Box, Checkbox, Flex, TextField, Select, TextArea, Text, Code, } from '@radix-ui/themes';
import { ErrorText, HelperText, Label } from '@/components/common/Form';
import { WebhookData } from './WebhookReturnDataFieldTable';
import { WebhookHeaders } from './WebhookHeaders';
import { TriggerEvents } from './utils';
import { ChatlyWebhook } from '@/types/ChatlyIntegrations/ChatlyWebhook';
import { UserFields, UserListContext } from '@/utils/users/UserListProvider';
import { ChannelListContext, ChannelListContextType, ChannelListItem, } from '@/utils/channel/ChannelListProvider';
import { UserAvatar } from '@/components/common/UserAvatar';
import { SidebarIcon } from '@/components/layout/Sidebar';
import { useGetUser } from '@/hooks/useGetUser';
import { ChannelIcon } from '@/utils/layout/channelIcon';

export const WebhookForm = ({ isEdit = false }: { isEdit?: boolean }) => {
    const { register, formState: { errors }, control, setValue, watch } = useFormContext<ChatlyWebhook>()

    const security = watch('enable_security')

    const needCondition = watch('trigger_webhook_on_condition')

    const conditionOn = watch('conditions_on')

    const { users } = useContext(UserListContext)

    const { channels } = useContext(ChannelListContext) as ChannelListContextType

    const webhookTrigger = watch('webhook_trigger')

    const triggerOn = useMemo(() => {
        if (webhookTrigger) {
            return TriggerEvents?.find((event) => event.label === webhookTrigger)?.trigger_on
        }
        return []
    }, [webhookTrigger])

    return (
        <Flex direction='column' gap='4' >
            {isEdit === false ? <Box>
                <Label htmlFor='name' isRequired>Name</Label>
                <TextField.Root {...register('name', {
                    required: 'Name is required', maxLength: {
                        value: 140,
                        message: "Name should not exceed 140 characters"
                    }

                })} />
                {errors?.name && <ErrorText>{errors.name.message}</ErrorText>}
            </Box> : null}
            <Box>
                <Label htmlFor='request_url' isRequired>Request URL</Label>
                <TextField.Root {...register('request_url', {
                    required: 'Request URL is required',
                    maxLength: {
                        value: 140,
                        message: "Request URL should not exceed 140 characters"
                    }
                })} />
                {errors?.request_url && <ErrorText>{errors.request_url.message}</ErrorText>}
            </Box>
            <Box>
                <Label htmlFor='timeout'>Request Timeout</Label>
                <TextField.Root type='number' {...register('timeout', {
                    valueAsNumber: true,
                })} />
                <HelperText>The number of seconds until the request expires</HelperText>
                {errors?.timeout && <ErrorText>{errors.timeout.message}</ErrorText>}
            </Box>
            <Box>
                <Controller
                    control={control}
                    name='enable_security'
                    render={({ field }) => (
                        <Flex direction={'row'} gap={'2'} align={'center'}>
                            <Checkbox checked={field.value ? true : false} onClick={() => field.onChange(!field.value)} />
                            <Label htmlFor='enable_security' >
                                Enable Security
                            </Label>
                        </Flex>
                    )}
                />
                {errors?.enable_security && <ErrorText>{errors.enable_security.message}</ErrorText>}
            </Box>
            {security ? <Box>
                <Label htmlFor='webhook_secret' >Webhook Secret</Label>
                <TextField.Root type='password' {...register('webhook_secret', {
                    maxLength: {
                        value: 140,
                        message: "Webhook secret should not exceed 140 characters"
                    }
                })} />
                {errors?.webhook_secret && <ErrorText>{errors.webhook_secret.message}</ErrorText>}
            </Box> : null}
            <Box >
                <Flex direction={'column'}>

                    <Label isRequired>Trigger Event</Label>
                    <Controller
                        control={control}
                        name='webhook_trigger'
                        rules={{
                            onChange: (e) => {
                                if (e.target.value) {
                                    setValue('webhook_data', [])

                                }
                            }
                        }}
                        render={({ field }) => (
                            <Select.Root value={field.value} onValueChange={field.onChange} required disabled={isEdit}>
                                <Select.Trigger placeholder='Trigger Events' />
                                <Select.Content>
                                    <Select.Group>
                                        <Select.Label>Trigger Events</Select.Label>
                                        {
                                            TriggerEvents?.map((event, index) => (
                                                <Select.Item key={index} value={event.label}>{event.label}</Select.Item>
                                            ))
                                        }
                                    </Select.Group>
                                </Select.Content>
                            </Select.Root>
                        )}
                    />
                </Flex>
            </Box>
            <Box>
                <Controller
                    control={control}
                    name='trigger_webhook_on_condition'
                    rules={{
                        onChange: (e) => {
                            if (!e.target.value) {
                                setValue('conditions_on', '')
                                setValue('condition', '')
                                setValue('channel_id', '')
                                setValue('user', '')
                                setValue('channel_type', '')
                            }
                        }
                    }}
                    render={({ field }) => (
                        <Flex direction={'row'} gap={'2'} align={'center'}>
                            <Checkbox checked={field.value ? true : false} onClick={() => field.onChange(!field.value)} />
                            <Label htmlFor='need_condition' >
                                Trigger this webhook based on a condition
                            </Label>
                        </Flex>
                    )}
                />
                {errors?.enable_security && <ErrorText>{errors.enable_security.message}</ErrorText>}
            </Box>
            {needCondition ?
                <Flex direction={'column'}>
                    <Label htmlFor='condition'>Trigger On</Label>
                    <Controller
                        control={control}
                        name='conditions_on'
                        rules={{
                            required: 'Field is required',
                            onChange: (e) => {
                                if (e.target.value) {
                                    setValue('condition', '')
                                    setValue('channel_id', '')
                                    setValue('user', '')
                                    setValue('channel_type', '')
                                }
                            }
                        }}
                        render={({ field }) => (
                            <Select.Root value={field.value} onValueChange={field.onChange} required>
                                <Select.Trigger placeholder='Select Field' />
                                <Select.Content>
                                    <Select.Group>
                                        <Select.Label>Trigger On</Select.Label>
                                        {triggerOn?.map((event, index) => (
                                            <Select.Item key={index} value={event}>{event}</Select.Item>
                                        ))}
                                        <Select.Item value='Custom'>Custom</Select.Item>
                                    </Select.Group>
                                </Select.Content>
                            </Select.Root>
                        )}
                    />
                    <HelperText style={{
                        paddingTop: '0.25rem'
                    }}>Field on which the condition will be applied</HelperText>
                </Flex> : null}
            {conditionOn === 'Custom' ? <Box>
                <Flex direction={'row'} gap={'4'} align={'end'}>
                    <Flex direction={'column'} style={{
                        width: '60%'
                    }} >
                        <Label htmlFor='condition'>Condition</Label>
                        <TextArea {...register('condition')} rows={4} />
                        <HelperText style={{
                            paddingTop: '0.25rem'
                        }}>The webhook will be triggered if this expression is true</HelperText>
                    </Flex>
                    <Code color='gray' size='2' className='mb-5 p-1.5'>
                        <Text weight='bold' size='2' className='block'>Try something like:</Text>
                        doc.channel_id == 'general'<br />
                        doc.is_direct_message == 1 <br />
                        doc.owner == 'Administrator'
                    </Code>
                </Flex>
            </Box> : conditionOn === 'Channel' ? <Box>
                <Flex direction={'column'}>
                    <Label htmlFor='channel_id'>Channel</Label>
                    <Controller
                        control={control}
                        name='channel_id'
                        render={({ field }) => (
                            <Select.Root value={field.value} onValueChange={field.onChange} required>
                                <Select.Trigger placeholder='Select Field' />
                                <Select.Content>
                                    <Select.Group>
                                        <Select.Label>Channel</Select.Label>
                                        {
                                            channels.map((channel, index) => (
                                                <Select.Item key={index} value={channel.name}>
                                                    <ChannelItem channel={channel} />
                                                </Select.Item>
                                            ))
                                        }
                                    </Select.Group>
                                </Select.Content>
                            </Select.Root>
                        )}
                    />
                    <HelperText style={{
                        paddingTop: '0.25rem'
                    }}>Webhook will trigger only if the message is sent on this channel.</HelperText>
                </Flex>
            </Box> : conditionOn === 'User' ? <Flex direction={'column'}>
                <Label htmlFor='user_id'>User</Label>
                <Controller
                    control={control}
                    name='user'
                    render={({ field }) => (
                        <Select.Root value={field.value} onValueChange={field.onChange} required>
                            <Select.Trigger placeholder='Select Field' />
                            <Select.Content>
                                <Select.Group>
                                    <Select.Label>User</Select.Label>
                                    {
                                        users.map((user, index) => (
                                            <Select.Item key={index} value={user.name}>
                                                <DirectMessageItem user={user} />
                                            </Select.Item>
                                        ))
                                    }
                                </Select.Group>
                            </Select.Content>
                        </Select.Root>
                    )}
                />
                <HelperText style={{
                    paddingTop: '0.25rem'
                }}>Condition for webhook - user</HelperText>
            </Flex> : conditionOn === 'Channel Type' ? <Flex direction={'column'}>
                <Label htmlFor='channel_type'>Channel Type</Label>
                <Controller
                    control={control}
                    name='channel_type'
                    render={({ field }) => (
                        <Select.Root value={field.value} onValueChange={field.onChange} required>
                            <Select.Trigger placeholder='Select Field' />
                            <Select.Content>
                                <Select.Group>
                                    <Select.Label>Channel Type</Select.Label>
                                    <Select.Item value='Public'>Public</Select.Item>
                                    <Select.Item value='Private'>Private</Select.Item>
                                    <Select.Item value='Open'>Open</Select.Item>
                                    <Select.Item value='DM'>Direct Message</Select.Item>
                                    <Select.Item value='Self Message'>Self Message</Select.Item>
                                </Select.Group>
                            </Select.Content>
                        </Select.Root>
                    )}
                />
                <HelperText style={{
                    paddingTop: '0.25rem'
                }}>The webhook will trigger if the channel type is equal to the value selected here.</HelperText>
            </Flex> : null
            }
            <Flex direction={'column'} gap={'4'}  >
                <WebhookData />
                <WebhookHeaders />
            </Flex>
        </Flex >
    )
}

export const DirectMessageItem = ({ user }: { user: UserFields }) => {

    const userData = useGetUser(user?.name)

    return <Flex direction={'row'} gap={'2'} align={'center'}>
        <SidebarIcon>
            <UserAvatar src={userData?.user_image} alt={userData?.full_name} size='1' />
        </SidebarIcon>
        <Flex justify='between'>
            <Text size='2' className="text-ellipsis line-clamp-1" >
                {userData?.full_name ?? user?.name}
            </Text>
        </Flex>
    </Flex>
}

export const ChannelItem = ({ channel }: { channel: ChannelListItem }) => {
    return <Flex direction={'row'} gap={'2'} align={'center'}>
        <ChannelIcon type={channel.type} size='18' />
        <Flex justify='between' align={'center'} width='100%'>
            <Text size='2' className="text-ellipsis line-clamp-1" as='span' >{channel.channel_name}</Text>
        </Flex>
    </Flex>
}
