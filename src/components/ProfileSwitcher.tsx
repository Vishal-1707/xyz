import { useFamilyProfile } from '@/contexts/FamilyProfileContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, User } from 'lucide-react';

const ProfileSwitcher = () => {
  const { profiles, currentProfile, setCurrentProfile } = useFamilyProfile();

  if (!currentProfile || profiles.length === 0) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRelationIcon = (relation: string) => {
    if (relation.toLowerCase() === 'self') return <Crown className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        Viewing:
      </div>
      
      <Select value={currentProfile.id} onValueChange={(value) => {
        const profile = profiles.find(p => p.id === value);
        if (profile) setCurrentProfile(profile);
      }}>
        <SelectTrigger className="w-auto min-w-[200px] h-auto p-2">
          <SelectValue>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={currentProfile.avatar_url} />
                <AvatarFallback className="text-xs">{getInitials(currentProfile.name)}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="font-medium">{currentProfile.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  {getRelationIcon(currentProfile.relation)}
                  {currentProfile.relation}
                  {currentProfile.age && `, Age ${currentProfile.age}`}
                </div>
              </div>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {profiles.map((profile) => (
            <SelectItem key={profile.id} value={profile.id}>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-xs">{getInitials(profile.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {profile.name}
                    {profile.is_primary && <Crown className="h-3 w-3" />}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    {getRelationIcon(profile.relation)}
                    {profile.relation}
                    {profile.age && `, Age ${profile.age}`}
                  </div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProfileSwitcher;