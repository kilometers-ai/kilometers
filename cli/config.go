package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strconv"
)

// Config holds the CLI configuration
type Config struct {
	APIEndpoint string `json:"api_endpoint"`
	APIKey      string `json:"api_key,omitempty"`
	BatchSize   int    `json:"batch_size"`
	Debug       bool   `json:"debug"`
}

// DefaultConfig returns the default configuration
func DefaultConfig() *Config {
	return &Config{
		APIEndpoint: "http://localhost:5194",
		BatchSize:   10,
		Debug:       false,
	}
}

// LoadConfig loads configuration from file or returns default
func LoadConfig() (*Config, error) {
	config := DefaultConfig()

	// Override with environment variables if present
	if endpoint := os.Getenv("KILOMETERS_API_URL"); endpoint != "" {
		config.APIEndpoint = endpoint
	}

	if apiKey := os.Getenv("KILOMETERS_API_KEY"); apiKey != "" {
		config.APIKey = apiKey
	}

	if os.Getenv("KM_DEBUG") == "true" {
		config.Debug = true
	}

	// Read batch size from environment if set
	if batchSize := os.Getenv("KM_BATCH_SIZE"); batchSize != "" {
		if size, err := strconv.Atoi(batchSize); err == nil && size > 0 {
			config.BatchSize = size
		}
	}

	// Try to load from config file
	configPath := getConfigPath()
	if data, err := os.ReadFile(configPath); err == nil {
		if err := json.Unmarshal(data, config); err != nil {
			return nil, err
		}
	}

	return config, nil
}

// SaveConfig saves configuration to file
func SaveConfig(config *Config) error {
	configPath := getConfigPath()

	// Create config directory if it doesn't exist
	if err := os.MkdirAll(filepath.Dir(configPath), 0755); err != nil {
		return err
	}

	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(configPath, data, 0644)
}

// getConfigPath returns the path to the config file
func getConfigPath() string {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		// Fallback to current directory
		return ".kilometers-config.json"
	}

	return filepath.Join(homeDir, ".config", "kilometers", "config.json")
}
