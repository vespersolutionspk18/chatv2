
export interface ChatlySettings{
	creation: string
	name: string
	modified: string
	owner: string
	modified_by: string
	docstatus: 0 | 1 | 2
	parent?: string
	parentfield?: string
	parenttype?: string
	idx?: number
	/**	Automatically add system users to Chatly : Check	*/
	auto_add_system_users?: 0 | 1
	/**	Show Chatly on Desk : Check	*/
	show_chatly_on_desk?: 0 | 1
	/**	Tenor API Key : Data	*/
	tenor_api_key?: string
}