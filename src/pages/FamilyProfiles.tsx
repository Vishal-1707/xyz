import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFamilyProfile, FamilyProfile } from '@/contexts/FamilyProfileContext';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, User, Crown, ArrowLeft } from 'lucide-react';

const FamilyProfiles = () => {
  const { profiles, currentProfile, createProfile, updateProfile, deleteProfile, setCurrentProfile } = useFamilyProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<FamilyProfile | null>(null);
  const [formData, setFormData] = useState({
    profile_id: '',
    name: '',
    age: '',
    gender: '',
    relation: '',
    email: '',
    phone: '',
    is_primary: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const profileData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : undefined,
        profile_id: formData.profile_id || `P${Date.now()}`,
      };

      if (editingProfile) {
        await updateProfile(editingProfile.id, profileData);
        toast({ title: "Profile updated successfully" });
      } else {
        await createProfile(profileData);
        toast({ title: "Profile created successfully" });
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to save profile",
        variant: "destructive" 
      });
    }
  };

  const handleEdit = (profile: FamilyProfile) => {
    setEditingProfile(profile);
    setFormData({
      profile_id: profile.profile_id,
      name: profile.name,
      age: profile.age?.toString() || '',
      gender: profile.gender || '',
      relation: profile.relation,
      email: profile.email || '',
      phone: profile.phone || '',
      is_primary: profile.is_primary,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (profile: FamilyProfile) => {
    if (profiles.length === 1) {
      toast({
        title: "Cannot delete",
        description: "You must have at least one family profile",
        variant: "destructive"
      });
      return;
    }

    try {
      await deleteProfile(profile.id);
      toast({ title: "Profile deleted successfully" });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to delete profile",
        variant: "destructive" 
      });
    }
  };

  const resetForm = () => {
    setFormData({
      profile_id: '',
      name: '',
      age: '',
      gender: '',
      relation: '',
      email: '',
      phone: '',
      is_primary: false,
    });
    setEditingProfile(null);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRelationIcon = (relation: string) => {
    if (relation.toLowerCase() === 'self') return <Crown className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Family Profiles</h1>
            <p className="text-muted-foreground">Manage your family members' health profiles</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Family Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingProfile ? 'Edit Family Member' : 'Add New Family Member'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid w-full gap-1.5">
                <Label htmlFor="relation">Relation *</Label>
                <Select value={formData.relation} onValueChange={(value) => setFormData({ ...formData, relation: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Self">Self</SelectItem>
                    <SelectItem value="Father">Father</SelectItem>
                    <SelectItem value="Mother">Mother</SelectItem>
                    <SelectItem value="Son">Son</SelectItem>
                    <SelectItem value="Daughter">Daughter</SelectItem>
                    <SelectItem value="Spouse">Spouse</SelectItem>
                    <SelectItem value="Brother">Brother</SelectItem>
                    <SelectItem value="Sister">Sister</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid w-full gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="grid w-full gap-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="is_primary"
                  type="checkbox"
                  checked={formData.is_primary}
                  onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_primary">Set as primary profile</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingProfile ? 'Update' : 'Create'} Profile
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {currentProfile && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Currently Viewing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={currentProfile.avatar_url} />
                <AvatarFallback>{getInitials(currentProfile.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{currentProfile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {currentProfile.relation} 
                  {currentProfile.age && `, Age ${currentProfile.age}`}
                  {currentProfile.gender && ` • ${currentProfile.gender}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => (
          <Card key={profile.id} className={`relative ${profile.id === currentProfile?.id ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {profile.name}
                      {profile.is_primary && (
                        <Badge variant="secondary" className="text-xs">
                          <Crown className="h-3 w-3 mr-1" />
                          Primary
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      {getRelationIcon(profile.relation)}
                      {profile.relation}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {profile.age && (
                  <p><span className="font-medium">Age:</span> {profile.age}</p>
                )}
                {profile.gender && (
                  <p><span className="font-medium">Gender:</span> {profile.gender}</p>
                )}
                {profile.email && (
                  <p><span className="font-medium">Email:</span> {profile.email}</p>
                )}
                {profile.phone && (
                  <p><span className="font-medium">Phone:</span> {profile.phone}</p>
                )}
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant={profile.id === currentProfile?.id ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setCurrentProfile(profile)}
                  disabled={profile.id === currentProfile?.id}
                >
                  {profile.id === currentProfile?.id ? 'Active' : 'Switch To'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleEdit(profile)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleDelete(profile)}
                  disabled={profiles.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FamilyProfiles;