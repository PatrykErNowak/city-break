import { Fragment } from 'react';

export default function Messages(props) {
  const aiMsgContent = props.aiTypingMsg ? props.streamedData || props.aiTypingMsg : props.streamedData;
  return (
    <Fragment>
      <div className="mb-4">
        <h2 className="text-xl text-gray-300">You</h2>
        <p className="text-gray-400 text-sm lg:text-base rounded-lg bg-gray-700 p-2 inline-block">{props.userPrompt}</p>
      </div>
      <div className="my-4">
        <h2 className="text-xl text-gray-300">AI</h2>
        <p className="text-gray-400 text-sm lg:text-base rounded-lg bg-zinc-700 p-2 ">{aiMsgContent}</p>
      </div>
    </Fragment>
  );
}
