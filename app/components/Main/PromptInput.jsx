export default function PromptInput({ value, onChange, id, name }) {
  return (
    <input
      value={value}
      onChange={onChange}
      aria-label="Wprowadź zapytanie do AI"
      type="text"
      required
      name={name}
      id={id}
      placeholder="Wprowadź zapytanie do AI"
      className="w-full rounded-lg px-6 py-3 bg-transparent border-solid border-gray-500 border resize-y overflow-hidden max-h-52 text-gray-300 h-14 focus:outline-none focus:border-gray-400"
    />
  );
}
