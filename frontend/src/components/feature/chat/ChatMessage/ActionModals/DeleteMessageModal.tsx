import { useFrappeDeleteDoc } from "frappe-react-sdk"
import { ErrorBanner } from "../../../../layout/AlertBanner"
import { AlertDialog, Button, Callout, Flex, Text } from "@radix-ui/themes"
import { Loader } from "@/components/common/Loader"
import { FiAlertTriangle } from "react-icons/fi"
import { Message } from "../../../../../../../types/Messaging/Message"
import { toast } from "sonner"

interface DeleteMessageModalProps {
    onClose: (refresh?: boolean) => void,
    message: Message
}

export const DeleteMessageModal = ({ onClose, message }: DeleteMessageModalProps) => {

    const { deleteDoc, error, loading: deletingDoc } = useFrappeDeleteDoc()

    const onSubmit = async () => {

        return deleteDoc('Chatly Message', message.name).then(() => {
            toast('Message deleted')
            onClose()
        })
    }

    return (
        <>
            <AlertDialog.Title>
                Delete Message
            </AlertDialog.Title>

            <Flex direction={'column'} gap='2'>
                <Callout.Root color="red" size='1'>
                    <Callout.Icon>
                        <FiAlertTriangle size='18' />
                    </Callout.Icon>
                    <Callout.Text size='2'>
                        This action is permanent and cannot be undone.
                    </Callout.Text>
                </Callout.Root>

                <ErrorBanner error={error} />
                <Text size='3'>Are you sure you want to delete this message? It will be deleted for all users.</Text>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
                <AlertDialog.Cancel>
                    <Button variant="soft" color="gray">
                        Cancel
                    </Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action>
                    <Button variant="solid" color="red" onClick={onSubmit} disabled={deletingDoc}>
                        {deletingDoc && <Loader />}
                        {deletingDoc ? "Deleting" : "Delete"}
                    </Button>
                </AlertDialog.Action>
            </Flex>
        </>
    )
}