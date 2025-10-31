interface Props {
  index: number;
  type: string;
}

export const UnknownBlock: React.FC<Props> = ({ index, type }) => {
  return (
    <div
      key={index}
      className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md"
    >
      <p className="text-yellow-800">Unknown content type: {type}</p>
    </div>
  );
};

export default UnknownBlock;
