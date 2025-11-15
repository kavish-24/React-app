import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Divider, Avatar } from 'react-native-paper';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { theme } from '../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const user = auth.currentUser;

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getInitials = (email) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label={getInitials(user?.email)}
          style={styles.avatar}
        />
        <Text variant="headlineSmall" style={styles.name}>
          {user?.email || 'User'}
        </Text>
        <Text variant="bodyMedium" style={styles.email}>
          {user?.email}
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="account-circle"
              size={24}
              color={theme.colors.primary}
            />
            <View style={styles.infoContent}>
              <Text variant="bodySmall" style={styles.infoLabel}>
                Account Type
              </Text>
              <Text variant="bodyMedium">Standard User</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="email"
              size={24}
              color={theme.colors.primary}
            />
            <View style={styles.infoContent}>
              <Text variant="bodySmall" style={styles.infoLabel}>
                Email
              </Text>
              <Text variant="bodyMedium">{user?.email}</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="shield-check"
              size={24}
              color={theme.colors.primary}
            />
            <View style={styles.infoContent}>
              <Text variant="bodySmall" style={styles.infoLabel}>
                Account Status
              </Text>
              <Text variant="bodyMedium">Verified</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            About WeatherNow
          </Text>
          <Text variant="bodySmall" style={styles.aboutText}>
            WeatherNow provides real-time weather information for cities around
            the world. Save your favorite locations and stay updated with current
            weather conditions.
          </Text>
          <Text variant="bodySmall" style={styles.versionText}>
            Version 1.0.0
          </Text>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
        contentStyle={styles.logoutButtonContent}
        icon="logout"
      >
        Sign Out
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  avatar: {
    backgroundColor: theme.colors.primary,
    marginBottom: 16,
  },
  name: {
    marginBottom: 4,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  email: {
    color: theme.colors.placeholder,
  },
  card: {
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    color: theme.colors.placeholder,
    marginBottom: 4,
  },
  divider: {
    marginVertical: 8,
  },
  sectionTitle: {
    marginBottom: 12,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  aboutText: {
    color: theme.colors.placeholder,
    lineHeight: 20,
    marginBottom: 12,
  },
  versionText: {
    color: theme.colors.placeholder,
    fontStyle: 'italic',
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  logoutButtonContent: {
    paddingVertical: 8,
  },
});

