export function AlertBox({ type = 'info', icon: Icon, title, message, children }) {
    const styles = {
        error: {
            container: 'p-4 bg-red-50 border border-red-200 rounded-md',
            icon: 'w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0',
            title: 'text-red-800 font-medium',
            message: 'text-red-600 text-sm mt-1',
        },
        warning: {
            container: 'p-4 bg-yellow-50 border border-yellow-200 rounded-md',
            icon: 'w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0',
            title: 'text-yellow-800 font-medium',
            message: 'text-yellow-700 text-sm mt-1',
        },
        success: {
            container: 'p-4 bg-green-50 border border-green-200 rounded-md',
            icon: 'w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0',
            title: 'text-green-800 font-medium',
            message: 'text-green-700 text-sm mt-1',
        },
    };

    const style = styles[type] || styles.info;

    return (
        <div className={style.container}>
            <div className={`flex items-start${children ? ' mb-4' : ''}`}>
                <Icon className={style.icon} />
                <div>
                    <p className={style.title}>{title}</p>
                    <p className={style.message}>{message}</p>
                </div>
            </div>
            {children}
        </div>
    );
}
