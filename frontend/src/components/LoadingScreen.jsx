export default function Loading({ width = 128, height = 128 }) {
  return (
    <div>
      <div
        className="bg-gray-100 animate-pulse duration-300 rounded-md"
        style={{ width: `${width}px`, height: `${height}px` }}
      ></div>
    </div>
  );
}
