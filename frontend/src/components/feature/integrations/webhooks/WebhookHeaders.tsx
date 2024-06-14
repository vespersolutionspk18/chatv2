import { HelperText } from "@/components/common/Form";
import { ChatlyWebhook } from "@/types/ChatlyIntegrations/ChatlyWebhook";
import { Flex, Box, Heading, Table, TextField, IconButton, Button } from "@radix-ui/themes";
import { useFieldArray, useFormContext } from "react-hook-form";
import { BiMinusCircle } from "react-icons/bi";
import { BsPlus } from "react-icons/bs";

export const WebhookHeaders = () => {
    const { register } = useFormContext<ChatlyWebhook>()

    const { fields, append, remove } = useFieldArray({
        name: 'webhook_headers'
    });

    return (
        <Box>
            <Flex direction='column' gap='2' width='100%'>
                <Flex direction='row' align='end' justify={'between'}>
                    <Flex direction={'column'} gap='1'>
                        <Heading size='4'>Headers</Heading>
                        <HelperText>Add the headers that you want to send with the request.</HelperText>
                    </Flex>
                    <Button size={'1'} type="button" onClick={() => append({ fieldname: '', key: '' })} variant="outline" style={{
                        width: 'fit-content',
                    }}><BsPlus size={'14'} />
                        Add</Button>
                </Flex>

                <Table.Root variant='surface'>
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeaderCell>Key <span className={'text-red-500'}>*</span> </Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>value</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell width={'8%'}></Table.ColumnHeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {fields.map((field, index) => (
                            <Table.Row key={field.id}>
                                <Table.Cell>
                                    <TextField.Root {...register(`webhook_headers.${index}.key`, {
                                        required: 'Key is required'
                                    })} placeholder='Key' />
                                </Table.Cell>
                                <Table.Cell>
                                    <TextField.Root {...register(`webhook_headers.${index}.value`)} placeholder='Value' />
                                </Table.Cell>
                                <Table.Cell width={'8%'}>
                                    <IconButton
                                        size={'2'}
                                        variant="ghost"
                                        color="gray"
                                        style={{
                                            // @ts-ignore
                                            '--icon-button-ghost-padding': '0',
                                            height: 'var(--base-button-height)',
                                            width: 'var(--base-button-height)',
                                        }}
                                        aria-label="Click to remove field"
                                        title='Remove field'
                                        onClick={() => remove(index)}>
                                        <BiMinusCircle size={'18'} />
                                    </IconButton>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            </Flex>
        </Box>
    )
}