import React, { useState, useEffect } from "react";
import "./page-all.css";
import OcGroup from "./group";
import type { OcGroupInfo } from "./group";

interface ExpandedGroups {
  [groupId: string]: boolean;
}

const PageOcList: React.FC = () => {
  const [expandedGroups, setExpandedGroups] = useState<ExpandedGroups>({});

  // Placeholder data - this would normally come from a JSON file
  const groupWithOcsData: OcGroupInfo[] = [
    {
      id: "class-10a",
      name: "Class 10A - Mathematics",
      ocList: [
        {
          id: "1",
          name: "Emma Johnson",
          avatar:
            "https://images.unsplash.com/photo-1494790108755-2616c96d1a57?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: "2",
          name: "Liam Smith",
          avatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: "3",
          name: "Sophia Davis",
          avatar:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: "4",
          name: "Noah Wilson",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: "5",
          name: "Olivia Brown",
          avatar:
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: "6",
          name: "William Jones",
          avatar:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        },
      ],
    },
    {
      id: "class-10b",
      name: "Class 10B - Science",
      ocList: [
        {
          id: "7",
          name: "Ava Garcia",
          avatar:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: "8",
          name: "James Miller",
          avatar:
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: "9",
          name: "Isabella Taylor",
          avatar:
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: "10",
          name: "Benjamin Anderson",
          avatar:
            "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: "11",
          name: "Mia Thomas",
          avatar:
            "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face",
        },
      ],
    },
    {
      id: "class-11a",
      name: "Class 11A - Literature",
      ocList: [
        {
          id: "12",
          name: "Ethan Jackson",
          avatar:
            "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: "13",
          name: "Charlotte White",
          avatar:
            "https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: "14",
          name: "Alexander Harris",
          avatar:
            "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: "15",
          name: "Amelia Martin",
          avatar:
            "https://images.unsplash.com/photo-1532074205216-d0e1f4b87368?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: "16",
          name: "Lucas Thompson",
          avatar:
            "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: "17",
          name: "Harper Lewis",
          avatar:
            "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: "18",
          name: "Henry Lee",
          avatar:
            "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: "19",
          name: "Evelyn Walker",
          avatar:
            "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&h=150&fit=crop&crop=face",
        },
      ],
    },
    {
      id: "class-12a",
      name: "Class 12A - Advanced Chemistry",
      ocList: [
        {
          id: "20",
          name: "Sebastian Hall",
          avatar:
            "https://images.unsplash.com/photo-1558222218-b7b54eede3f3?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: "21",
          name: "Abigail Allen",
          avatar:
            "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: "22",
          name: "Owen Young",
          avatar:
            "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: "23",
          name: "Emily King",
          avatar:
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face",
        },
      ],
    },
  ];

  // Initialize all categories as expanded
  useEffect(() => {
    const initialState: ExpandedGroups = {};
    groupWithOcsData.forEach((group) => {
      initialState[group.id] = true;
    });
    setExpandedGroups(initialState);
  }, []);

  const toggleGroup = (groupId: string): void => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  return (
    <div>
      <div>
        {groupWithOcsData.map((classInfo) => (
          <OcGroup
            key={classInfo.id}
            groupInfo={classInfo}
            isExpanded={expandedGroups[classInfo.id]}
            onToggle={toggleGroup}
          />
        ))}
      </div>
    </div>
  );
};

export default PageOcList;
