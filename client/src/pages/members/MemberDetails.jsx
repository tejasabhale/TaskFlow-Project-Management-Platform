
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Mail,
    Phone,
    UserRound,
    ShieldCheck,
    CalendarDays,
    AtSign,
    LoaderCircle,
    AlertCircle,
} from "lucide-react";

import { getUserProfileById } from "../../services/profile.service.js";

const MemberDetails = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchMember = async () => {
            if (!userId) {
                setError("Member ID is missing.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response = await getUserProfileById(userId);
                setMember(response.data);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load member details."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchMember();
    }, [userId]);

    const formatDate = (date) => {
        if (!date) return "Not available";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Not available";
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const initials =
        member?.fullName
            ?.trim()
            .split(/\s+/)
            .filter(Boolean)
            .map((part) => part[0])
            .slice(0, 2)
            .join("")
            .toUpperCase() || "M";

    const details = member
        ? [
            {
                label: "Full Name",
                value: member.fullName || "Not provided",
                icon: UserRound,
            },
            {
                label: "Username",
                value: member.userName
                    ? `@${member.userName}`
                    : "Not provided",
                icon: AtSign,
            },
            {
                label: "Email Address",
                value: member.email || "Not provided",
                icon: Mail,
            },
            {
                label: "Mobile Number",
                value: member.mobileNo || "Not provided",
                icon: Phone,
            },
            {
                label: "Account Role",
                value: member.role || "user",
                icon: ShieldCheck,
            },
            {
                label: "Joined On",
                value: formatDate(member.createdAt),
                icon: CalendarDays,
            },
        ]
        : [];

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center gap-3 text-teal-700">
                <LoaderCircle size={24} className="animate-spin" />
                <span className="text-sm font-medium">
                    Loading member details...
                </span>
            </div>
        );
    }

    if (error || !member) {
        return (
            <div className="mx-auto w-full max-w-5xl space-y-5 p-4 sm:p-6">
                <button
                    type="button"
                    onClick={() => navigate("/dashboard/members")}
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-teal-700"
                >
                    <ArrowLeft size={18} />
                    Back to Members
                </button>

                <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
                    <div className="flex items-center gap-2 font-medium">
                        <AlertCircle size={20} />
                        Unable to load member
                    </div>

                    <p className="mt-2 text-sm">
                        {error || "Member not found."}
                    </p>

                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="mt-4 text-sm font-semibold underline underline-offset-4"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
            <button
                type="button"
                onClick={() => navigate("/dashboard/members")}
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-teal-700"
            >
                <ArrowLeft size={18} />
                Back to Members
            </button>

            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                    Member Details
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    View member profile and account information.
                </p>
            </div>

            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <div className="h-1.5 bg-teal-700" />

                <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
                    {member.avatar?.url ? (
                        <img
                            src={member.avatar.url}
                            alt={member.fullName || "Member avatar"}
                            className="h-20 w-20 shrink-0 rounded-2xl border border-gray-200 object-cover"
                        />
                    ) : (
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-2xl font-semibold text-teal-800">
                            {initials}
                        </div>
                    )}

                    <div className="min-w-0 flex-1">
                        <h2 className="break-words text-xl font-semibold text-gray-900">
                            {member.fullName || "Unnamed Member"}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            @{member.userName || "unknown"}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-700">
                                {member.role || "user"}
                            </span>

                            <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${member.isVerified
                                        ? "bg-green-50 text-green-700"
                                        : "bg-amber-50 text-amber-700"
                                    }`}
                            >
                                {member.isVerified
                                    ? "Verified account"
                                    : "Not verified"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 px-6 py-5">
                    <h3 className="text-sm font-semibold text-gray-900">
                        Account Information
                    </h3>

                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {details.map(({ label, value, icon: Icon }) => (
                            <div
                                key={label}
                                className="flex min-w-0 gap-3 rounded-xl border border-gray-100 p-4"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                                    <Icon size={19} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-gray-500">
                                        {label}
                                    </p>
                                    <p className="mt-1 break-words text-sm font-medium text-gray-900">
                                        {value}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default MemberDetails;
