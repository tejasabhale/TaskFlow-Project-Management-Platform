import { FiMoreHorizontal, FiPlus } from "react-icons/fi";

const Members = () => {
  const members = [
    {
      name: "Tejas Abhale",
      email: "tejas@example.com",
      role: "Owner",
      tasks: 12,
    },
    {
      name: "Rahul Patil",
      email: "rahul@example.com",
      role: "Admin",
      tasks: 8,
    },
    {
      name: "Priya Shah",
      email: "priya@example.com",
      role: "Member",
      tasks: 6,
    },
    {
      name: "Aditya Joshi",
      email: "aditya@example.com",
      role: "Member",
      tasks: 4,
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Members</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your workspace members.
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white">
          <FiPlus size={17} />
          Invite Member
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        {members.map((member, index) => (
          <div
            key={member.email}
            className={`flex items-center justify-between p-5 ${
              index !== members.length - 1 ? "border-b border-gray-100" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold">
                {member.name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">
                  {member.name}
                </p>

                <p className="mt-1 text-xs text-gray-500">{member.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <span className="hidden text-xs text-gray-500 sm:block">
                {member.tasks} tasks
              </span>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                {member.role}
              </span>

              <button className="text-gray-400 hover:text-gray-700">
                <FiMoreHorizontal size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Members;
