
const MessageBubble = ({ message }) => {
    const isOutbound = message.direction === 'outbound';
    const bubbleColor = isOutbound ? 'bg-whatsappBubbleGreen' : 'bg-white';
    const textColor = 'text-whatsappText';
    const alignment = isOutbound ? 'self-end' : 'self-start';
    const borderRadius = isOutbound ? 'rounded-tl-xl rounded-tr-xl rounded-bl-xl' : 'rounded-tl-xl rounded-tr-xl rounded-br-xl';

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'sent':
                return <span className="text-whatsappStatusSent text-xs ml-1">✓</span>;
            case 'delivered':
                return <span className="text-whatsappStatusDelivered text-xs ml-1">✓✓</span>;
            case 'read':
                return <span className="text-whatsappStatusRead text-xs ml-1">✓✓</span>;
            default:
                return null;
        }
    };

    return (
        <div className={`flex ${alignment} max-w-[80%] my-2`}>
            <div className={`p-3 ${bubbleColor} ${textColor} ${borderRadius} shadow-sm relative`}>
                <p className="text-sm font-medium pr-12">{message.text}</p>
                <div className="absolute bottom-1 right-2 flex items-center text-[10px] text-gray-500">
                    <span>{formatTime(message.timestamp)}</span>
                    {isOutbound && getStatusIcon(message.status)}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
