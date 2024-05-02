export default function Message({ data }) {
  const isHuman = data.type === 'human';

  return (
    <div className="mb-4">
      <h2 className={`text-xl text-gray-300 ${isHuman ? 'capitalize' : 'uppercase'}`}>{isHuman ? 'you' : 'ai'}</h2>
      <p className={`text-gray-400 text-sm lg:text-base rounded-lg p-2  inline-block ${isHuman ? 'bg-gray-700' : 'bg-zinc-700'}`}>
        {data.message || <LoadingDots></LoadingDots>}
      </p>
    </div>
  );
}

function LoadingDots() {
  const commonStyles = `inline-block animate-pulse text-slate-200 scale-110 mx-[1px]`;
  return (
    <>
      <span className={`${commonStyles} [animation-delay:-0.3s]`}>.</span>
      <span className={`${commonStyles} [animation-delay:-0.15s]`}>.</span>
      <span className={`${commonStyles}`}>.</span>
    </>
  );
}
