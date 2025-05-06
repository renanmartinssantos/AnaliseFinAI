// BaseStyles.js
import { StyleSheet } from 'react-native';

export const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  header: {
    padding: 24,
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
  },
  balanceChange: {
    fontSize: 14,
    marginTop: 4,
  },
  chartContainer: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  chart: {
    borderRadius: 16,
  },
  section: {
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  assetItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  assetDetails: {
    flex: 1,
    marginLeft: 16,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '500',
  },
  assetValue: {
    fontSize: 14,
  },
  assetChange: {
    fontSize: 16,
    fontWeight: "bold",
  },
  newsItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  newsImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  newsContent: {
    flex: 1,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  newsSource: {
    fontSize: 14,
  },
});