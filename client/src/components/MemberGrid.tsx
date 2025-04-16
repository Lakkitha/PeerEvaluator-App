import React from "react";
import MemberCard from "./MemberCard";

// Interface for member data
interface Member {
  id: string;
  name: string;
  profilePicture?: string | null;
  level: "beginner" | "intermediate" | "expert";
  score: number;
  maxScore?: number;
}

interface MemberGridProps {
  members: Member[];
  loading?: boolean;
  emptyMessage?: string;
}

const MemberGrid: React.FC<MemberGridProps> = ({
  members,
  loading = false,
  emptyMessage = "No members found",
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {members.map((member) => (
        <MemberCard
          key={member.id}
          id={member.id}
          name={member.name}
          profilePicture={member.profilePicture}
          level={member.level}
          score={member.score}
          maxScore={member.maxScore}
        />
      ))}
    </div>
  );
};

export default MemberGrid;
