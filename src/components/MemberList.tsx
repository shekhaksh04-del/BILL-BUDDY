import React, { useState } from 'react';
import { UserPlus, Trash2, Smile, Palette, Check } from 'lucide-react';
import { Member } from '../types';
import { AVATAR_COLORS, AVATAR_EMOJIS } from '../utils/billCalculator';

interface MemberListProps {
  members: Member[];
  onUpdateMember: (id: string, updates: Partial<Member>) => void;
  onAddMember: () => void;
  onRemoveMember: (id: string) => void;
  targetCount: number;
  onSyncTargetCount: (newTarget: number) => void;
}

export const MemberList: React.FC<MemberListProps> = ({
  members,
  onUpdateMember,
  onAddMember,
  onRemoveMember,
  targetCount,
  onSyncTargetCount,
}) => {
  const [activePickerId, setActivePickerId] = useState<string | null>(null);

  // If targetCount > members.length, show how many remaining to add
  const remainingToAdd = Math.max(0, targetCount - members.length);

  const handleAddAllRemaining = () => {
    const toAdd = targetCount - members.length;
    for (let i = 0; i < toAdd; i++) {
      onAddMember();
    }
  };

  return (
    <div className="bg-white dark:bg-[#121c19] rounded-2xl border border-[#e2eee7] dark:border-[#1d3028] shadow-[0_10px_30px_-4px_rgba(18,43,31,0.05)] p-5 sm:p-6 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#eef5f1] dark:border-[#1d3028] gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-[#111827] dark:text-white flex items-center gap-2">
            <span>2. Members & Avatars</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
              {members.length} {members.length === 1 ? 'Person' : 'People'}
            </span>
          </h2>
          <p className="text-xs text-[#4b5563] dark:text-[#9ca3af] mt-0.5 font-medium">
            Starts with Person 1 & Person 2 — customize names and avatars
          </p>
        </div>

        {/* Action button to add member */}
        <div className="flex items-center gap-2 flex-wrap">
          {remainingToAdd > 0 && (
            <button
              type="button"
              onClick={handleAddAllRemaining}
              className="text-xs font-bold px-3 py-1.5 rounded-xl btn-mint-soft cursor-pointer btn-tactile"
            >
              Add remaining {remainingToAdd} members
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              onAddMember();
              if (members.length >= targetCount) {
                onSyncTargetCount(members.length + 1);
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-[#182823] text-[#111827] dark:text-[#f3f4f6] hover:text-emerald-700 dark:hover:text-emerald-300 border border-[#d6e5dd] dark:border-[#21372e] hover:border-emerald-400 dark:hover:border-emerald-600 btn-tactile cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>+ Add Member</span>
          </button>
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="space-y-3">
        {members.map((member, index) => {
          const isPickerOpen = activePickerId === member.id;

          return (
            <div
              key={member.id}
              className="relative p-3.5 rounded-xl border border-[#e2eee7] dark:border-[#1d3028] bg-[#f8faf9] dark:bg-[#15231f] hover:border-emerald-300 dark:hover:border-emerald-700 transition shadow-2xs"
            >
              <div className="flex items-center gap-3">
                {/* Avatar Button / Selector */}
                <button
                  type="button"
                  onClick={() => setActivePickerId(isPickerOpen ? null : member.id)}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm border border-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer relative group ${member.avatarColor}`}
                  title="Click to change avatar icon & color"
                >
                  <span>{member.avatarEmoji || member.name.charAt(0).toUpperCase() || '👤'}</span>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-[#111827] border border-[#d6e5dd] dark:border-[#21372e] flex items-center justify-center text-[9px] text-[#4b5563] dark:text-[#d1d5db] shadow-xs">
                    ✎
                  </div>
                </button>

                {/* Member Name Input */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[11px] text-[#6b7280] dark:text-[#9ca3af] mb-1">
                    <span className="font-semibold text-emerald-800 dark:text-emerald-300">Member #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => setActivePickerId(isPickerOpen ? null : member.id)}
                      className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer transition"
                    >
                      <Palette className="w-3 h-3" />
                      <span>Customize Style</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => onUpdateMember(member.id, { name: e.target.value })}
                    placeholder={`Person ${index + 1}`}
                    className="w-full px-3 py-1.5 text-sm font-bold text-[#111827] dark:text-[#f3f4f6] bg-white dark:bg-[#182823] rounded-lg border border-[#d6e5dd] dark:border-[#21372e] focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                  />
                </div>

                {/* Remove Member Button (active if > 2 members) */}
                {members.length > 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      onRemoveMember(member.id);
                      if (members.length - 1 < targetCount) {
                        onSyncTargetCount(members.length - 1);
                      }
                    }}
                    className="p-2 text-[#9ca3af] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition cursor-pointer btn-tactile"
                    title={`Remove ${member.name || `Person ${index + 1}`}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Avatar Picker Drawer */}
              {isPickerOpen && (
                <div className="mt-3 pt-3 border-t border-[#dce8e1] dark:border-[#1d3028] space-y-2.5 animate-fadeIn">
                  {/* Emoji selector */}
                  <div>
                    <span className="text-[11px] font-bold text-[#374151] dark:text-[#d1d5db] block mb-1.5 flex items-center gap-1">
                      <Smile className="w-3 h-3 text-emerald-600" /> Select Emoji Icon:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {AVATAR_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => onUpdateMember(member.id, { avatarEmoji: emoji })}
                          className={`w-8 h-8 rounded-xl text-sm flex items-center justify-center transition border cursor-pointer btn-tactile ${
                            member.avatarEmoji === emoji
                              ? 'bg-emerald-100 border-emerald-500 scale-110 shadow-xs'
                              : 'bg-white dark:bg-[#182823] border-[#d6e5dd] dark:border-[#21372e] hover:border-emerald-300'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color selector */}
                  <div>
                    <span className="text-[11px] font-bold text-[#374151] dark:text-[#d1d5db] block mb-1.5 flex items-center gap-1">
                      <Palette className="w-3 h-3 text-emerald-600" /> Select Color Theme:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {AVATAR_COLORS.map((col, cIdx) => (
                        <button
                          key={cIdx}
                          type="button"
                          onClick={() => onUpdateMember(member.id, { avatarColor: col })}
                          className={`w-7 h-7 rounded-xl transition flex items-center justify-center shadow-xs cursor-pointer btn-tactile ${col} ${
                            member.avatarColor === col ? 'ring-2 ring-offset-2 ring-emerald-500 scale-105' : 'opacity-85 hover:opacity-100'
                          }`}
                        >
                          {member.avatarColor === col && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setActivePickerId(null)}
                      className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline px-2 py-1 cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Helper prompt if members count is lower than target count */}
      {remainingToAdd > 0 && (
        <div className="mt-4 p-3.5 rounded-2xl border border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="text-xs text-emerald-900 dark:text-emerald-300">
            <span className="font-extrabold">Next member ready:</span> Click below to add Person {members.length + 1} of {targetCount}.
          </div>
          <button
            type="button"
            onClick={onAddMember}
            className="px-3.5 py-1.5 rounded-xl btn-mint-primary text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Person {members.length + 1}</span>
          </button>
        </div>
      )}
    </div>
  );
};
