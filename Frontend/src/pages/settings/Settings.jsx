import { FiCamera, FiLock, FiSave } from "react-icons/fi";

const Settings = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your account and security settings.
        </p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Profile */}
        <div className="rounded-xl border bg-white p-6">
          <h2 className="font-semibold">Profile</h2>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-xl font-semibold">
              TA
            </div>

            <button className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
              <FiCamera size={16} />
              Change Avatar
            </button>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                First Name
              </label>

              <input
                defaultValue="Tejas"
                className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Last Name
              </label>

              <input
                defaultValue="Abhale"
                className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium">Email</label>

            <input
              type="email"
              defaultValue="tejas@example.com"
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none"
            />
          </div>

          <button className="mt-5 flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white">
            <FiSave size={16} />
            Save Changes
          </button>
        </div>

        {/* Password */}
        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
              <FiLock size={17} />
            </div>

            <div>
              <h2 className="font-semibold">Change Password</h2>

              <p className="mt-1 text-xs text-gray-500">
                Update your account password.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <input
              type="password"
              placeholder="Current password"
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none"
            />

            <input
              type="password"
              placeholder="New password"
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none"
            />

            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none"
            />
          </div>

          <button className="mt-5 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white">
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
