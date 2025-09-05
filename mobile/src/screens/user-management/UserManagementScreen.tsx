import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const UserManagementScreen = () => {
  const navigation = useNavigation();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const currentUser = {
    id: 'current',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Owner',
    avatar: 'JD',
    isCurrentUser: true,
  };

  const teamMembers = [
    {
      id: '1',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      role: 'Editor',
      avatar: 'SW',
      lastActive: '2 hours ago',
      status: 'active',
    },
    {
      id: '2',
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      role: 'Viewer',
      avatar: 'MJ',
      lastActive: '1 day ago',
      status: 'active',
    },
    {
      id: '3',
      name: 'Emily Chen',
      email: 'emily.chen@example.com',
      role: 'Editor',
      avatar: 'EC',
      lastActive: '3 days ago',
      status: 'inactive',
    },
    {
      id: '4',
      name: 'David Brown',
      email: 'david.brown@example.com',
      role: 'Editor',
      avatar: 'DB',
      lastActive: '1 week ago',
      status: 'inactive',
    },
  ];

  const allUsers = [currentUser, ...teamMembers];

  const handleInviteTeammate = () => {
    navigation.navigate('InviteTeammate');
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleUserOptions = (user: any) => {
    if (user.isCurrentUser) return;

    Alert.alert(
      'User Options',
      `What would you like to do with ${user.name}?`,
      [
        {
          text: 'Change Role',
          onPress: () => handleChangeRole(user),
        },
        {
          text: 'Remove User',
          onPress: () => handleRemoveUser(user),
          style: 'destructive',
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleChangeRole = (user: any) => {
    Alert.alert(
      'Change Role',
      `Change ${user.name}'s role to:`,
      [
        { text: 'Editor', onPress: () => updateUserRole(user.id, 'Editor') },
        { text: 'Viewer', onPress: () => updateUserRole(user.id, 'Viewer') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleRemoveUser = (user: any) => {
    navigation.navigate('RemoveTeammateConfirmation', { user });
  };

  const updateUserRole = (userId: string, newRole: string) => {
    Alert.alert('Success', `User role updated to ${newRole}`);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Owner':
        return '#7C3AED';
      case 'Editor':
        return '#5546FF';
      case 'Viewer':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? '#22C55E' : '#EF4444';
  };

  const renderUserItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.userCard, item.isCurrentUser && styles.currentUserCard]}
      onPress={() => handleUserOptions(item)}
      disabled={item.isCurrentUser}
    >
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.avatar}</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={[styles.userName, item.isCurrentUser && styles.currentUserText]}>
              {item.name} {item.isCurrentUser && '(You)'}
            </Text>
            <Text style={styles.userEmail}>{item.email}</Text>
          </View>
        </View>

        <View style={styles.userMeta}>
          <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '20' }]}>
            <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>
              {item.role}
            </Text>
          </View>

          {!item.isCurrentUser && (
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
          )}
        </View>
      </View>

      {!item.isCurrentUser && (
        <View style={styles.userFooter}>
          <Text style={styles.lastActive}>Last active: {item.lastActive}</Text>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => handleUserOptions(item)}
          >
            <MaterialIcons name="more-vert" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}

      {item.isCurrentUser && (
        <View style={styles.ownerBadge}>
          <MaterialIcons name="admin-panel-settings" size={16} color="#7C3AED" />
          <Text style={styles.ownerText}>Workspace Owner</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.title}>Team Management</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Team Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{allUsers.length}</Text>
            <Text style={styles.statLabel}>Total Members</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {teamMembers.filter(u => u.status === 'active').length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {teamMembers.filter(u => u.status === 'inactive').length}
            </Text>
            <Text style={styles.statLabel}>Inactive</Text>
          </View>
        </View>

        {/* Team Members */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Team Members</Text>
            <TouchableOpacity
              style={styles.inviteButton}
              onPress={handleInviteTeammate}
            >
              <MaterialIcons name="person-add" size={20} color="#FFFFFF" />
              <Text style={styles.inviteButtonText}>Invite</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={allUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.userList}
          />
        </View>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <View style={styles.bulkActions}>
            <Text style={styles.bulkText}>
              {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
            </Text>
            <View style={styles.bulkButtons}>
              <TouchableOpacity style={styles.bulkButton}>
                <MaterialIcons name="edit" size={20} color="#5546FF" />
                <Text style={styles.bulkButtonText}>Change Role</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.bulkButton, styles.bulkButtonDanger]}>
                <MaterialIcons name="delete" size={20} color="#EF4444" />
                <Text style={styles.bulkButtonDangerText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5546FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  inviteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  userList: {
    paddingBottom: 20,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#5546FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  currentUserText: {
    color: '#7C3AED',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  userMeta: {
    alignItems: 'flex-end',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  userFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  lastActive: {
    fontSize: 12,
    color: '#6B7280',
  },
  moreButton: {
    padding: 4,
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  ownerText: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '500',
    marginLeft: 4,
  },
  bulkActions: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bulkText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 12,
  },
  bulkButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  bulkButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  bulkButtonDanger: {
    backgroundColor: '#FEF2F2',
  },
  bulkButtonText: {
    fontSize: 14,
    color: '#5546FF',
    marginLeft: 4,
  },
  bulkButtonDangerText: {
    color: '#EF4444',
  },
});

export default UserManagementScreen;
