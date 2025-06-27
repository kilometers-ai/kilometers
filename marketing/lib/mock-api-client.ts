import { ApiClient } from './api-client';

const mockApiClient: ApiClient = {
  getDashboardData: async () => {
    console.log("Fetching dashboard data from mock API...");
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      services: [
        { name: "Mock GitHub API", status: "normal", requests: 1337, distance: 234, cost: 23.45, trend: "+12%" },
        { name: "Mock Database", status: "warning", requests: 89, distance: 156, cost: 15.67, trend: "+340%" },
        { name: "Mock Slack API", status: "normal", requests: 45, distance: 67, cost: 8.11, trend: "+5%" },
      ],
      recentActivity: [
        { time: "2 min ago", action: "Mock GitHub API call", distance: "2.3 km", cost: "$0.02" },
        { time: "5 min ago", action: "Mock Database query", distance: "1.8 km", cost: "$0.01" },
        { time: "8 min ago", action: "Mock Slack message", distance: "0.9 km", cost: "$0.01" },
        { time: "12 min ago", action: "Mock GitHub API call", distance: "2.1 km", cost: "$0.02" },
      ],
    };
  },

  checkConnection: async (tool: string) => {
    console.log(`Simulating connection for ${tool} via mock API...`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    return {
      connected: true,
      firstRequest: {
        timestamp: new Date().toISOString(),
        source: `${tool} (Mock)`,
        destination: "OpenAI API",
        distance: 2.3,
        cost: 0.02,
        requestType: "completion",
      },
    };
  },
};

export default mockApiClient; 