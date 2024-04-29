export default function Button({ onClick, type = 'button', className = '', ariaLabel = '', children }) {
  return (
    <button
      onClick={onClick}
      type={type}
      aria-label={ariaLabel}
      className={` bg-zinc-500  rounded-lg focus:bg-zinc-400 hover:bg-zinc-400 focus:outline-none transition-colors duration-300 ${className}`}>
      {children}
    </button>
  );
}
