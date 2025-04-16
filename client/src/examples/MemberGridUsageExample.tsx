// Sample usage of MemberGrid in ClubAdminDashboard

// Add this import at the top of your file
import MemberGrid from "../components/MemberGrid";

// Add this function inside your component before the return statement
const getMemberLevelData = () => {
  // This would typically come from your backend or be calculated based on evaluations
  // Here's a sample implementation with mock data
  return clubMembers.map((member) => {
    // Determine level based on evaluation count - this is just an example logic
    let level: "beginner" | "intermediate" | "expert";
    if (member.evaluationCount >= 10) {
      level = "expert";
    } else if (member.evaluationCount >= 5) {
      level = "intermediate";
    } else {
      level = "beginner";
    }

    // Calculate a score (out of 100) based on mock data
    // In a real implementation, this would be based on actual evaluation scores
    const score = Math.floor(70 + Math.random() * 30);

    return {
      id: member.id,
      name: member.username,
      profilePicture: null, // You would use actual profile picture URLs
      level,
      score,
      maxScore: 100,
    };
  });
};

// Then in your JSX where you want to display the member grid
// Example for 'members' tab section:
{
  activeTab === "members" && (
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
          <svg
            className="w-5 h-5 absolute right-3 top-2.5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Member Grid Display */}
      <MemberGrid
        members={getMemberLevelData()}
        loading={loading}
        emptyMessage={
          searchTerm
            ? "No members match your search."
            : "No members in your club yet."
        }
      />
    </div>
  );
}
