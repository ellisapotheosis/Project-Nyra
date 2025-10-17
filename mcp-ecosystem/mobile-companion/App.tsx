import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
  SafeAreaView,
  Switch
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';
import { Ionicons } from '@expo/vector-icons';

// XulbuX Purple theme colors
const Colors = {
  primary: '#7572F7',
  accent: '#B38CFF',
  success: '#96FFBE',
  info: '#9CF6FF',
  warning: '#FFE066',
  error: '#FF5DAE',
  background: '#0A0A0F',
  surface: '#1A1A2E',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0'
};

interface MCPServer {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  port?: number;
  uptime?: number;
  lastActivity?: string;
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  networkIn: number;
  networkOut: number;
}

const App: React.FC = () => {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [serverEndpoint, setServerEndpoint] = useState('http://localhost:12008');

  useEffect(() => {
    loadSettings();
    initializeNotifications();
    fetchData();
    
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSettings = async () => {
    try {
      const endpoint = await AsyncStorage.getItem('serverEndpoint');
      const notifications = await AsyncStorage.getItem('notificationsEnabled');
      
      if (endpoint) setServerEndpoint(endpoint);
      if (notifications !== null) setNotificationsEnabled(JSON.parse(notifications));
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('serverEndpoint', serverEndpoint);
      await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(notificationsEnabled));
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  };

  const initializeNotifications = () => {
    PushNotification.configure({
      onNotification: function(notification) {
        console.log('Notification received:', notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });
  };

  const fetchData = async () => {
    try {
      // Fetch MCP server status
      const serversResponse = await fetch(`${serverEndpoint}/status`);
      if (serversResponse.ok) {
        const serverData = await serversResponse.json();
        
        const formattedServers: MCPServer[] = Object.entries(serverData.servers || {}).map(([id, data]: [string, any]) => ({
          id,
          name: data.name || id,
          status: data.status || 'unknown',
          port: data.port,
          uptime: data.uptime,
          lastActivity: data.lastActivity
        }));
        
        setServers(formattedServers);
        
        // Check for server issues and notify
        if (notificationsEnabled) {
          checkForIssues(formattedServers);
        }
      }

      // Fetch system metrics
      const metricsResponse = await fetch(`${serverEndpoint}/metrics`);
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics({
          cpu: metricsData.cpu || 0,
          memory: metricsData.memory || 0,
          disk: metricsData.disk || 0,
          networkIn: metricsData.network?.in || 0,
          networkOut: metricsData.network?.out || 0
        });
      }
    } catch (error) {
      console.log('Error fetching data:', error);
      if (notificationsEnabled) {
        PushNotification.localNotification({
          title: '🚨 NYRA MCP Alert',
          message: 'Unable to connect to development server',
          playSound: true,
        });
      }
    }
  };

  const checkForIssues = (currentServers: MCPServer[]) => {
    const errorServers = currentServers.filter(s => s.status === 'error');
    const stoppedServers = currentServers.filter(s => s.status === 'stopped');
    
    if (errorServers.length > 0) {
      PushNotification.localNotification({
        title: '❌ MCP Server Error',
        message: `${errorServers.length} server(s) have errors: ${errorServers.map(s => s.name).join(', ')}`,
        playSound: true,
      });
    }
    
    if (stoppedServers.length > 0) {
      PushNotification.localNotification({
        title: '⚠️ Servers Stopped',
        message: `${stoppedServers.length} server(s) are stopped: ${stoppedServers.map(s => s.name).join(', ')}`,
        playSound: false,
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleServerAction = async (serverId: string, action: 'start' | 'stop' | 'restart') => {
    try {
      const response = await fetch(`${serverEndpoint}/servers/${serverId}/${action}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        Alert.alert('Success', `Server ${action} command sent`);
        setTimeout(fetchData, 2000); // Refresh after 2 seconds
      } else {
        throw new Error(`Failed to ${action} server`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to ${action} server: ${error}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return Colors.success;
      case 'stopped': return Colors.textSecondary;
      case 'error': return Colors.error;
      default: return Colors.warning;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return 'checkmark-circle';
      case 'stopped': return 'stop-circle';
      case 'error': return 'alert-circle';
      default: return 'help-circle';
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NYRA MCP</Text>
        <Text style={styles.headerSubtitle}>Development Monitor</Text>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={Colors.accent}
          />
        }
      >
        {/* System Metrics */}
        {metrics && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 System Metrics</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>CPU</Text>
                <Text style={[styles.metricValue, { color: metrics.cpu > 80 ? Colors.error : Colors.success }]}>
                  {metrics.cpu.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Memory</Text>
                <Text style={[styles.metricValue, { color: metrics.memory > 80 ? Colors.error : Colors.info }]}>
                  {metrics.memory.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Disk</Text>
                <Text style={styles.metricValue}>{metrics.disk.toFixed(1)}%</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Network</Text>
                <Text style={styles.metricValue}>
                  ↑{metrics.networkOut.toFixed(1)} MB/s {'\n'}
                  ↓{metrics.networkIn.toFixed(1)} MB/s
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* MCP Servers */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔌 MCP Servers</Text>
          {servers.map(server => (
            <View key={server.id} style={styles.serverCard}>
              <View style={styles.serverHeader}>
                <View style={styles.serverInfo}>
                  <Ionicons 
                    name={getStatusIcon(server.status) as any} 
                    size={20} 
                    color={getStatusColor(server.status)} 
                  />
                  <Text style={styles.serverName}>{server.name}</Text>
                </View>
                <View style={styles.serverActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: Colors.success }]}
                    onPress={() => handleServerAction(server.id, 'start')}
                  >
                    <Ionicons name="play" size={16} color={Colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: Colors.error }]}
                    onPress={() => handleServerAction(server.id, 'stop')}
                  >
                    <Ionicons name="stop" size={16} color={Colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: Colors.accent }]}
                    onPress={() => handleServerAction(server.id, 'restart')}
                  >
                    <Ionicons name="refresh" size={16} color={Colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.serverDetails}>
                <Text style={styles.serverDetail}>
                  Status: <Text style={{ color: getStatusColor(server.status) }}>{server.status}</Text>
                </Text>
                {server.port && (
                  <Text style={styles.serverDetail}>Port: {server.port}</Text>
                )}
                {server.uptime && (
                  <Text style={styles.serverDetail}>Uptime: {formatUptime(server.uptime)}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚙️ Settings</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={(value) => {
                setNotificationsEnabled(value);
                saveSettings();
              }}
              thumbColor={Colors.accent}
              trackColor={{ false: Colors.textSecondary, true: Colors.primary }}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Text style={styles.refreshButtonText}>🔄 Refresh Now</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚡ Quick Actions</Text>
          
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: Colors.success }]}
            onPress={() => {
              servers.forEach(server => {
                if (server.status === 'stopped') {
                  handleServerAction(server.id, 'start');
                }
              });
            }}
          >
            <Text style={styles.quickActionText}>🚀 Start All Servers</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: Colors.error }]}
            onPress={() => {
              Alert.alert(
                'Stop All Servers',
                'Are you sure you want to stop all running servers?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Stop All', 
                    style: 'destructive',
                    onPress: () => {
                      servers.forEach(server => {
                        if (server.status === 'running') {
                          handleServerAction(server.id, 'stop');
                        }
                      });
                    }
                  }
                ]
              );
            }}
          >
            <Text style={styles.quickActionText}>🛑 Stop All Servers</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  serverCard: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  serverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serverName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginLeft: 8,
  },
  serverActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serverDetails: {
    marginLeft: 28,
  },
  serverDetail: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  refreshButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  quickActionButton: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
});

export default App;