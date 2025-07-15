# Chat Components

This directory contains modular React Native components for building a chat interface. The components are designed to be reusable, customizable, and follow modern UI/UX patterns.

## Components

### ChatHeader

A header component that displays navigation, project information, and connection status.

**Props:**

- `title: string` - The main title to display
- `subtitle?: string` - Optional subtitle (e.g., "Live" or "Offline")
- `connected: boolean` - Connection status
- `onBack: () => void` - Callback for back navigation

### MessageList

A scrollable list component that handles message grouping, date separators, and empty states.

**Props:**

- `messages: any[]` - Array of message objects
- `loading: boolean` - Loading state for refresh control
- `hasMoreMessages: boolean` - Whether there are more messages to load
- `selectedMessage: string | null` - Currently selected message ID
- `onLoadMore: () => void` - Callback to load more messages
- `onMessageSelect: (messageId: string | null) => void` - Callback for message selection
- `onMessageReply: (message: any) => void` - Callback for reply action
- `onMessageEdit: (message: any) => void` - Callback for edit action
- `onMessageDelete: (messageId: string) => void` - Callback for delete action
- `onImagePress: (attachment: any) => void` - Callback for image press
- `onDownload: (fileUrl: string, fileName: string) => void` - Callback for file download
- `isMessageSender: (messageUserId: string) => boolean` - Function to determine if user sent the message

### Message

Individual message component with support for text, attachments, replies, and actions.

**Props:**

- `message: any` - Message object
- `isSent: boolean` - Whether the message was sent by the current user
- `isSelected: boolean` - Whether the message is currently selected
- `onLongPress: () => void` - Callback for long press
- `onPress: () => void` - Callback for press
- `onReply: () => void` - Callback for reply action
- `onEdit: () => void` - Callback for edit action
- `onDelete: () => void` - Callback for delete action
- `onImagePress: (attachment: any) => void` - Callback for image press
- `onDownload: (fileUrl: string, fileName: string) => void` - Callback for file download

### ChatInput

Input component with support for text input, reply preview, and attachment handling.

**Props:**

- `message: string` - Current message text
- `onMessageChange: (text: string) => void` - Callback for text changes
- `onSend: () => void` - Callback for send action
- `replyingTo?: any` - Message being replied to
- `onCancelReply?: () => void` - Callback to cancel reply
- `connected?: boolean` - Connection status (default: true)
- `placeholder?: string` - Input placeholder text

### TypingIndicator

Animated typing indicator with dots animation.

**Props:**

- `typingUsers: string[]` - Array of user IDs who are typing

### ImageViewer

Full-screen image viewer modal for chat attachments.

**Props:**

- `visible: boolean` - Whether the modal is visible
- `image: any` - Image object to display
- `onClose: () => void` - Callback to close the modal
- `onDownload: (fileUrl: string, fileName: string) => void` - Callback for download

## Usage Example

```tsx
import {
  ChatHeader,
  MessageList,
  ChatInput,
  TypingIndicator,
  ImageViewer,
} from "@/components/project/chat";

export function ChatScreen() {
  // ... state and handlers

  return (
    <View style={{ flex: 1 }}>
      <ChatHeader
        title="Project Chat"
        subtitle="Live"
        connected={connected}
        onBack={() => router.back()}
      />

      <MessageList
        messages={messages}
        loading={loading}
        hasMoreMessages={hasMoreMessages}
        selectedMessage={selectedMessage}
        onLoadMore={loadMoreMessages}
        onMessageSelect={setSelectedMessage}
        onMessageReply={handleReply}
        onMessageEdit={handleEdit}
        onMessageDelete={handleDelete}
        onImagePress={handleImagePress}
        onDownload={handleDownload}
        isMessageSender={isMessageSender}
      />

      <TypingIndicator typingUsers={typingUsers} />

      <ChatInput
        message={message}
        onMessageChange={setMessage}
        onSend={handleSend}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        connected={connected}
      />

      <ImageViewer
        visible={!!selectedImage}
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
        onDownload={handleDownload}
      />
    </View>
  );
}
```

## Features

- **Modular Design**: Each component is self-contained and reusable
- **Enhanced UI**: Modern design with shadows, rounded corners, and smooth animations
- **Accessibility**: Proper touch targets and semantic markup
- **Performance**: Optimized rendering and minimal re-renders
- **TypeScript**: Full type safety with proper interfaces
- **Responsive**: Adapts to different screen sizes
- **Customizable**: Easy to style and extend

## Styling

All components use StyleSheet for consistent styling and performance. The design follows a modern chat interface with:

- Clean, minimal design
- Proper spacing and typography
- Subtle shadows and borders
- Consistent color scheme
- Smooth animations and transitions

## Dependencies

- React Native core components
- `date-fns` for date formatting
- `@/components/ui/text` for consistent text styling
- `@/components/ui/empty` for empty states
