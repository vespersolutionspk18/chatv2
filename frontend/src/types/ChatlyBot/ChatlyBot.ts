
export interface ChatlyBot{
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
	/**	Bot Name : Data	*/
	bot_name: string
	/**	Image : Attach Image	*/
	image?: string
	/**	Chatly User : Link - Chatly User	*/
	chatly_user?: string
	/**	Description : Small Text	*/
	description?: string
	/**	Is Standard : Check	*/
	is_standard?: 0 | 1
	/**	Module : Link - Module Def	*/
	module?: string
}