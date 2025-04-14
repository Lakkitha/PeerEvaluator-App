import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  isCurrentUserClubAdmin,
  getCurrentClubAdmin,
  getUnverifiedUsers,
  verifyUser,
  getEvaluationsForClub,
  getClubById,
  getClubMembers,
} from "../services/firebase";

interface UnverifiedUser {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

interface ClubEvaluation {
  id: string;
  userId: string;
  username: string;
  date: string;
  scores: {
    overallImpact: number;
  };
}

interface ClubMember {
  id: string;
  username: string;
  email: string;
  isVerified: boolean;
  joinedDate: string;
  evaluationCount: number;
}

interface ScheduledEvaluation {
  id: string;
  title: string;
  scheduledDate: string;
  speakerId: string;
  speakerName: string;
  evaluatorId: string;
  evaluatorName: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface ClubSettings {
  meetingDay: string;
  meetingTime: string;
  meetingLocation: string;
  allowGuestEvaluations: boolean;
  evaluationCategories: string[];
}

const ClubAdminDashboard = () => {
  const [unverifiedUsers, setUnverifiedUsers] = useState<UnverifiedUser[]>([]);
  const [clubData, setClubData] = useState<{ id: string; name: string } | null>(
    null
  );
  const [recentEvaluations, setRecentEvaluations] = useState<ClubEvaluation[]>(
    []
  );
  const [clubMembers, setClubMembers] = useState<ClubMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [scheduledEvaluations, setScheduledEvaluations] = useState<ScheduledEvaluation[]>([]);
  const [clubSettings, setClubSettings] = useState<ClubSettings>({
    meetingDay: "Monday",
    meetingTime: "18:00",
    meetingLocation: "Main Conference Room",
    allowGuestEvaluations: false,
    evaluationCategories: ["Delivery", "Content", "Visual Aids", "Time Management", "Overall Impact"],
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newEvaluation, setNewEvaluation] = useState({
    title: "",
    scheduledDate: "",
    speakerId: "",
    evaluatorId: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [notificationCount, setNotificationCount] = useState(unverifiedUsers.length);

  useEffect(() => {
    async function checkAdminAndLoadUsers() {
      try {
        const isAdmin = await isCurrentUserClubAdmin();
        if (!isAdmin) {
          navigate("/home");
          return;
        }

        const adminData = await getCurrentClubAdmin();

        const club = await getClubById(adminData.clubID);
        setClubData({
          id: adminData.clubID,
          name: club ? club.clubName : adminData.adminName + "'s Club",
        });

        const users = await getUnverifiedUsers();
        setUnverifiedUsers(users);
        setNotificationCount(users.length);

        const evaluations = await getEvaluationsForClub(adminData.clubID);
        setRecentEvaluations(
          evaluations.slice(0, 5).map((evaluation) => ({
            id: evaluation.id,
            userId: evaluation.userId,
            username: evaluation.username || "Unknown User",
            date: evaluation.date,
            scores: {
              overallImpact: evaluation.scores.overallImpact,
            },
          }))
        );

        if (adminData.clubID) {
          const members = await getClubMembers(adminData.clubID);
          setClubMembers(members);
        }

        setScheduledEvaluations([
          {
            id: "eval1",
            title: "Leadership Speech Evaluation",
            scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            speakerId: "speaker1",
            speakerName: "John Davis",
            evaluatorId: "evaluator1",
            evaluatorName: "Sarah Johnson",
            status: 'scheduled'
          },
          {
            id: "eval2",
            title: "Technical Presentation Review",
            scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            speakerId: "speaker2",
            speakerName: "Michael Wong",
            evaluatorId: "evaluator2",
            evaluatorName: "Lisa Chen",
            status: 'scheduled'
          }
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    checkAdminAndLoadUsers();
  }, [navigate]);

  const handleVerifyUser = async (userId: string) => {
    try {
      await verifyUser(userId);
      setUnverifiedUsers((prev) => prev.filter((user) => user.id !== userId));
      setNotificationCount(prev => prev - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify user");
    }
  };

  const handleRejectUser = async (userId: string) => {
    alert(`User rejection for ${userId} is not fully implemented yet.`);
    setUnverifiedUsers((prev) => prev.filter((user) => user.id !== userId));
    setNotificationCount(prev => prev - 1);
  };

  const handleScheduleEvaluation = () => {
    if (!newEvaluation.title || !newEvaluation.scheduledDate || 
        !newEvaluation.speakerId || !newEvaluation.evaluatorId) {
      setError("All fields are required to schedule an evaluation");
      return;
    }

    const speakerName = clubMembers.find(m => m.id === newEvaluation.speakerId)?.username || "Unknown";
    const evaluatorName = clubMembers.find(m => m.id === newEvaluation.evaluatorId)?.username || "Unknown";

    const newScheduledEval: ScheduledEvaluation = {
      id: `eval${Date.now()}`,
      title: newEvaluation.title,
      scheduledDate: new Date(newEvaluation.scheduledDate).toISOString(),
      speakerId: newEvaluation.speakerId,
      speakerName: speakerName,
      evaluatorId: newEvaluation.evaluatorId,
      evaluatorName: evaluatorName,
      status: 'scheduled'
    };

    setScheduledEvaluations(prev => [...prev, newScheduledEval]);
    setNewEvaluation({
      title: "",
      scheduledDate: "",
      speakerId: "",
      evaluatorId: ""
    });
    setShowScheduleModal(false);
  };

  const handleSaveSettings = () => {
    setShowSettingsModal(false);
  };

  const handleGenerateReport = () => {
    alert("Report generation functionality would be implemented here");
  };

  const filteredMembers = clubMembers.filter(member => 
    member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-center">
          Club Coordinator Dashboard
          {clubData && (
            <span className="block text-xl font-normal mt-2 text-gray-600">
              {clubData.name}
            </span>
          )}
        </h1>
        
        <div className="flex items-center">
          <div className="relative mr-4">
            <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {notificationCount}
                </span>
              )}
            </button>
          </div>
          
          <button
            onClick={() => setShowSettingsModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-200"
          >
            Club Settings
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          className={`py-2 px-4 font-medium whitespace-nowrap ${
            activeTab === "overview"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`py-2 px-4 font-medium whitespace-nowrap ${
            activeTab === "members"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("members")}
        >
          Members
        </button>
        <button
          className={`py-2 px-4 font-medium whitespace-nowrap ${
            activeTab === "evaluations"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("evaluations")}
        >
          Evaluations
        </button>
        <button
          className={`py-2 px-4 font-medium whitespace-nowrap ${
            activeTab === "schedule"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("schedule")}
        >
          Schedule
        </button>
        <button
          className={`py-2 px-4 font-medium whitespace-nowrap ${
            activeTab === "reports"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("reports")}
        >
          Reports
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="grid gap-8 grid-cols-1">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Unverified Users</h2>

            {unverifiedUsers.length === 0 ? (
              <p className="text-gray-600">No unverified users at this time.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {unverifiedUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleVerifyUser(user.id)}
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => handleRejectUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Recent Evaluations</h2>
              <button 
                onClick={() => setActiveTab("evaluations")}
                className="text-blue-600 hover:text-blue-800"
              >
                View All
              </button>
            </div>

            {recentEvaluations.length === 0 ? (
              <p className="text-gray-600">
                No evaluations recorded for your club yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Overall Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentEvaluations.map((evaluation) => (
                      <tr key={evaluation.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {evaluation.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(evaluation.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {evaluation.scores.overallImpact}/10
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() =>
                              navigate(`/evaluation/${evaluation.id}`)
                            }
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Upcoming Evaluations</h2>
              <button 
                onClick={() => setActiveTab("schedule")}
                className="text-blue-600 hover:text-blue-800"
              >
                View Schedule
              </button>
            </div>

            {scheduledEvaluations.length === 0 ? (
              <p className="text-gray-600">No upcoming evaluations scheduled.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Speaker
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Evaluator
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {scheduledEvaluations.map((scheduledEval) => (
                      <tr key={scheduledEval.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {scheduledEval.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(scheduledEval.scheduledDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {scheduledEval.speakerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {scheduledEval.evaluatorName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "members" && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Club Members</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search members..."
                className="px-4 py-2 border border-gray-300 rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="w-5 h-5 absolute right-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>

          {filteredMembers.length === 0 ? (
            <p className="text-gray-600">No members in your club yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Evaluations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {member.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {member.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(member.joinedDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {member.evaluationCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/admin/member-progress/${member.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View Progress
                        </Link>
                        <button className="text-orange-600 hover:text-orange-900">
                          Send Message
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "evaluations" && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-6">All Evaluations</h2>
          
          {recentEvaluations.length === 0 ? (
            <p className="text-gray-600">
              No evaluations recorded for your club yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Overall Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentEvaluations.map((evaluation) => (
                    <tr key={evaluation.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {evaluation.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(evaluation.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {evaluation.scores.overallImpact}/10
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() =>
                            navigate(`/evaluation/${evaluation.id}`)
                          }
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "schedule" && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Evaluation Schedule</h2>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-200"
            >
              Schedule New Evaluation
            </button>
          </div>

          {scheduledEvaluations.length === 0 ? (
            <p className="text-gray-600">No evaluations scheduled.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Speaker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Evaluator
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {scheduledEvaluations.map((scheduledEval) => (
                    <tr key={scheduledEval.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {scheduledEval.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(scheduledEval.scheduledDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {scheduledEval.speakerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {scheduledEval.evaluatorName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${scheduledEval.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' : 
                            scheduledEval.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {scheduledEval.status.charAt(0).toUpperCase() + scheduledEval.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="text-red-600 hover:text-red-900">
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "reports" && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-6">Club Reports</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Member Progress Report</h3>
              <p className="text-gray-600 mb-4">
                Generate a comprehensive report of all members' progress and evaluation history.
              </p>
              <button 
                onClick={handleGenerateReport}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-200"
              >
                Generate Report
              </button>
            </div>
            
            <div className="border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Club Performance Summary</h3>
              <p className="text-gray-600 mb-4">
                View club-wide metrics and performance trends over time.
              </p>
              <button 
                onClick={handleGenerateReport}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-200"
              >
                Generate Report
              </button>
            </div>
            
            <div className="border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Attendance Report</h3>
              <p className="text-gray-600 mb-4">
                Track member attendance and participation in club activities.
              </p>
              <button 
                onClick={handleGenerateReport}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-200"
              >
                Generate Report
              </button>
            </div>
            
            <div className="border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Evaluation Metrics</h3>
              <p className="text-gray-600 mb-4">
                Analyze evaluation scores and feedback patterns across the club.
              </p>
              <button 
                onClick={handleGenerateReport}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-200"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Club Settings</h3>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Day
                </label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={clubSettings.meetingDay}
                  onChange={(e) => setClubSettings({...clubSettings, meetingDay: e.target.value})}
                >
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Time
                </label>
                <input 
                  type="time" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={clubSettings.meetingTime}
                  onChange={(e) => setClubSettings({...clubSettings, meetingTime: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Location
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={clubSettings.meetingLocation}
                  onChange={(e) => setClubSettings({...clubSettings, meetingLocation: e.target.value})}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowGuestEvaluations"
                  checked={clubSettings.allowGuestEvaluations}
                  onChange={(e) => setClubSettings({...clubSettings, allowGuestEvaluations: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allowGuestEvaluations" className="ml-2 block text-sm text-gray-900">
                  Allow guest evaluations
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Evaluation Categories
                </label>
                <div className="space-y-2">
                  {clubSettings.evaluationCategories.map((category, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                        value={category}
                        onChange={(e) => {
                          const updatedCategories = [...clubSettings.evaluationCategories];
                          updatedCategories[index] = e.target.value;
                          setClubSettings({...clubSettings, evaluationCategories: updatedCategories});
                        }}
                      />
                      <button 
                        onClick={() => {
                          const updatedCategories = clubSettings.evaluationCategories.filter((_, i) => i !== index);
                          setClubSettings({...clubSettings, evaluationCategories: updatedCategories});
                        }}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => {
                    setClubSettings({
                      ...clubSettings, 
                      evaluationCategories: [...clubSettings.evaluationCategories, ""]
                    });
                  }}
                  className="mt-2 text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add Category
                </button>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Schedule New Evaluation</h3>
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Evaluation Title
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newEvaluation.title}
                  onChange={(e) => setNewEvaluation({...newEvaluation, title: e.target.value})}
                  placeholder="e.g. Leadership Speech Evaluation"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newEvaluation.scheduledDate}
                  onChange={(e) => setNewEvaluation({...newEvaluation, scheduledDate: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Speaker
                </label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newEvaluation.speakerId}
                  onChange={(e) => setNewEvaluation({...newEvaluation, speakerId: e.target.value})}
                >
                  <option value="">Select Speaker</option>
                  {clubMembers.map(member => (
                    <option key={member.id} value={member.id}>{member.username}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Evaluator
                </label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newEvaluation.evaluatorId}
                  onChange={(e) => setNewEvaluation({...newEvaluation, evaluatorId: e.target.value})}
                >
                  <option value="">Select Evaluator</option>
                  {clubMembers.map(member => (
                    <option key={member.id} value={member.id}>{member.username}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleScheduleEvaluation}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Schedule Evaluation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubAdminDashboard;
