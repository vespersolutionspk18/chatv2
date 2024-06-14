export const hasChatlyUserRole = () => {

    if (import.meta.env.DEV) {
        return true
    }
    //@ts-expect-error
    return (window?.frappe?.boot?.user?.roles ?? []).includes('Chatly User');
}

export const isSystemManager = () => {
    //@ts-expect-error
    return (window?.frappe?.boot?.user?.roles ?? []).includes('System Manager');
}

export const hasServerScriptEnabled = () => {
    if (import.meta.env.DEV) {
        return true
    }
    // @ts-expect-error
    return (window?.frappe?.boot?.server_script_enabled)
}