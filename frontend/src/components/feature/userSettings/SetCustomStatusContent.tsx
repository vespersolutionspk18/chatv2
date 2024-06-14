import EmojiPicker from '@/components/common/EmojiPicker/EmojiPicker'
import { ErrorText, Label } from '@/components/common/Form'
import { Loader } from '@/components/common/Loader'
import { ErrorBanner } from '@/components/layout/AlertBanner'
import useCurrentChatlyUser from '@/hooks/useCurrentChatlyUser'
import { useUserData } from '@/hooks/useUserData'
import { Button, Dialog, Flex, TextField, Text, IconButton } from '@radix-ui/themes'
import { useFrappePostCall } from 'frappe-react-sdk'
import { useCallback, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { BiSmile } from 'react-icons/bi'
import { toast } from 'sonner'

const SetCustomStatusContent = ({ onClose }: { onClose: VoidFunction }) => {

    const userData = useUserData()
    const { myProfile, mutate } = useCurrentChatlyUser()

    const methods = useForm({
        defaultValues: {
            custom_status: myProfile?.custom_status ?? ''
        }
    })
    const { register, handleSubmit, formState: { errors } } = methods

    const { call, error, loading } = useFrappePostCall('frappe.client.set_value')
    const onSubmit = useCallback((data: { custom_status: string }) => {
        call({
            doctype: 'Chatly User',
            name: userData.name,
            fieldname: 'custom_status',
            value: data.custom_status
        }).then(() => {
            toast.success("User status updated")
            mutate()
            onClose()
        })
    }, [userData.name])

    const onEmojiSelect = (emoji: string) => {
        methods.setValue('custom_status', `${methods.getValues('custom_status')} ${emoji}`)
    }

    const [isEmojiPickerOpen, setEmojiPickerOpen] = useState(false)

    return (
        <>
            <Dialog.Title>Set a custom status</Dialog.Title>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)}>

                    <ErrorBanner error={error} />

                    <Flex direction={'column'} gap={'2'}>
                        <Label size='2' color='gray' weight='regular' htmlFor='custom_status'>Share what you're up to</Label>
                        <Flex align={'center'} gap='3'>
                            <Flex direction={'column'} gap='1'>
                                <TextField.Root
                                    id="custom_status"
                                    autoFocus
                                    placeholder='e.g. Out of Office'
                                    maxLength={140}
                                    {...register('custom_status', {
                                        maxLength: {
                                            value: 140,
                                            message: "Status cannot be more than 140 characters."
                                        }
                                    })}
                                    className='min-w-[21rem]'
                                    aria-invalid={errors.custom_status ? 'true' : 'false'}>

                                    <TextField.Slot side='right'>
                                        <IconButton type='button' className={'rounded-full'} onClick={() => setEmojiPickerOpen(!isEmojiPickerOpen)} variant='ghost' color='gray'>
                                            <BiSmile size='18' />
                                        </IconButton>
                                    </TextField.Slot>
                                </TextField.Root>
                                {errors.custom_status && <ErrorText>{errors.custom_status.message}</ErrorText>}
                            </Flex>

                        </Flex>
                        {isEmojiPickerOpen && <EmojiPicker onSelect={onEmojiSelect} />}
                    </Flex>

                    <Flex gap="3" mt="6" justify="end" align='center'>
                        <Dialog.Close disabled={loading}>
                            <Button variant="soft" color="gray">Cancel</Button>
                        </Dialog.Close>
                        <Button type='submit' disabled={loading}>
                            {loading && <Loader />}
                            {loading ? "Saving" : "Save"}
                        </Button>
                    </Flex>
                </form>
            </FormProvider>
        </>
    )
}

export default SetCustomStatusContent