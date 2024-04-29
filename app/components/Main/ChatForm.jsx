export default function ChatForm({ onSubmit, children }) {
  return (
    <form onSubmit={onSubmit} action="" className="relative mt-10">
      {children}
    </form>
  );
}
