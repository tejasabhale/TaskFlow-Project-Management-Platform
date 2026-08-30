import { FiSave, FiTrash2 } from "react-icons/fi";

const Workspace = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Workspace</h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your workspace settings.
        </p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* General */}
        <div className="rounded-xl border bg-white p-6">
          <h2 className="font-semibold">General</h2>

          <div className="mt-5 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Workspace Name
              </label>

              <input
                defaultValue="My Workspace"
                className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-gray-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                rows="4"
                defaultValue="My TaskFlow workspace."
                className="w-full resize-none rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-gray-400"
              />
            </div>
          </div>

          <button className="mt-5 flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white">
            <FiSave size={16} />
            Save Changes
          </button>
        </div>

        {/* Danger Zone */}
        <div className="rounded-xl border border-red-200 bg-white p-6">
          <h2 className="font-semibold text-red-600">Danger Zone</h2>

          <p className="mt-2 text-sm text-gray-500">
            Deleting the workspace is permanent and cannot be undone.
          </p>

          <button className="mt-5 flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
            <FiTrash2 size={16} />
            Delete Workspace
          </button>
        </div>
      </div>
    </div>
  );
};

export default Workspace;
