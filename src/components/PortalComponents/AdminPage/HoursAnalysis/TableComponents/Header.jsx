export default function Header({ projectColumns }) {
  return (
    <thead className="bg-gray-100 border-b">
      <tr>
        <th className="px-3 py-2 text-left">Employee Name</th>
        {projectColumns.map((project) => (
          <th key={project} className="px-3 py-2 text-center">
            {project}
          </th>
        ))}
      </tr>
    </thead>
  );
}
