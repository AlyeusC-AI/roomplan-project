export default function Category({
  defaultValue,
  onChange,
}: {
  defaultValue: string
  onChange: (s: string) => void
}) {
  return (
    <div className="col-span-1">
      <h2 className="block text-sm font-medium text-gray-700">Category</h2>
      <select
        id="category"
        name="category"
        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        defaultValue={defaultValue}
        onChange={(e) => onChange(e.target.value)}
      >
        <option>--</option>
        <option>1</option>
        <option>2</option>
        <option>3</option>
      </select>
    </div>
  )
}
