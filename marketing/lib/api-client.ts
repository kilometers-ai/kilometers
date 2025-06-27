export interface ApiClient {
  getDashboardData: () => Promise<any>;
  checkConnection: (tool: string) => Promise<any>;
}

const apiClient: ApiClient = {
  getDashboardData: async () => {
    // In a real application, you would fetch this data from your API
    console.log("Fetching dashboard data from real API...");
    // Simulating a network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Example response structure
    return {
      services: [
        { name: "GitHub API", status: "normal", requests: 1337, distance: 234, cost: 23.45, trend: "+12%" },
        { name: "Database", status: "warning", requests: 89, distance: 156, cost: 15.67, trend: "+340%" },
        { name: "Slack API", status: "normal", requests: 45, distance: 67, cost: 8.11, trend: "+5%" },
      ],
      recentActivity: [
        { time: "2 min ago", action: "GitHub API call", distance: "2.3 km", cost: "$0.02" },
        { time: "5 min ago", action: "Database query", distance: "1.8 km", cost: "$0.01" },
      ],
    };
  },

  checkConnection: async (tool: string) => {
    // In a real application, you would make an API call to check the connection
    console.log(`Checking connection for ${tool} via real API...`);
    // Simulating a network delay and success response
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { connected: true, firstRequest: { timestamp: new Date().toISOString(), source: tool } };
  },
};

export default apiClient; 