export default function Header({ title, children }) {
  return (
    <header className="border-gray-600 border-solid border-b pt-4 lg:pt-8">
      <h1 className="font-extrabold text-center text-xl lg:text-5xl text-gray-300">{title}</h1>
      <p className="text-gray-400 text-[13px] text-center lg:text-start lg:text-base py-3 lg:py-6">{children}</p>
    </header>
  );
}
