import pandas as pd
import numpy as np

# Convert 'Date' to datetime and extract 'Month' as a period
df['Date'] = pd.to_datetime(df['Date'])
df['Month'] = df['Date'].dt.to_period('M')

# Calculate Total Cost for percentage calculations
total_cost_overall = df['Cost'].sum()

# 1. Monthly Cost Trend with Month-over-Month (MoM) Growth
monthly_cost_trend = df.groupby('Month')['Cost'].sum().reset_index()
monthly_cost_trend = monthly_cost_trend.sort_values(by='Month')
# Calculate MoM Percentage Change
monthly_cost_trend['MoM_Growth_%'] = monthly_cost_trend['Cost'].pct_change() * 100
monthly_cost_trend['MoM_Growth_%'] = monthly_cost_trend['MoM_Growth_%'].fillna(0).round(2)

print('--- Monthly Cost Trend with MoM Growth ---\n')
print(monthly_cost_trend.to_string(index=False))
print("\n")

# 2. Total Cost by Service (Sorted with Percentage of Total)
service_cost = df.groupby('Service')['Cost'].sum().reset_index()
service_cost['%_of_Total'] = (service_cost['Cost'] / total_cost_overall * 100).round(2)
service_cost = service_cost.sort_values(by='Cost', ascending=False)

print('--- Top Cost Driving Services ---\n')
print(service_cost.to_string(index=False))
print("\n")

# 3. Total Cost by Instance Type (Sorted with Percentage of Total)
instance_type_cost = df.groupby('Instance_Type')['Cost'].sum().reset_index()
instance_type_cost['%_of_Total'] = (instance_type_cost['Cost'] / total_cost_overall * 100).round(2)
instance_type_cost = instance_type_cost.sort_values(by='Cost', ascending=False)

print('--- Cost by Instance Type ---\n')
print(instance_type_cost.to_string(index=False))
print("\n")

# 4. Total Cost by Environment (Sorted with Percentage of Total)
environment_cost = df.groupby('Environment')['Cost'].sum().reset_index()
environment_cost['%_of_Total'] = (environment_cost['Cost'] / total_cost_overall * 100).round(2)
environment_cost = environment_cost.sort_values(by='Cost', ascending=False)

print('--- Cost by Environment ---\n')
print(environment_cost.to_string(index=False))
print("\n")

# 5. Service and Environment Breakdown
service_environment_cost = df.groupby(['Service', 'Environment'])['Cost'].sum().reset_index()
service_environment_cost = service_environment_cost.sort_values(by=['Cost'], ascending=False)

print('--- Top Cost by Service & Environment ---\n')
print(service_environment_cost.head(10).to_string(index=False)) # Showing top 10 combinations
print("\n")

# Generated Insights Text
print('--- Automated Insights ---\n')
print(f"1. Total Cloud Spend: ${total_cost_overall:,.2f}")
if not monthly_cost_trend.empty and len(monthly_cost_trend) > 1:
    last_month = monthly_cost_trend.iloc[-1]
    prev_month = monthly_cost_trend.iloc[-2]
    print(f"2. Most Recent Month Spend ({last_month['Month']}): ${last_month['Cost']:,.2f} ({last_month['MoM_Growth_%']}% vs previous month)")

if not service_cost.empty:
    top_service = service_cost.iloc[0]
    print(f"3. Highest Cost Service: {top_service['Service']} accounting for {top_service['%_of_Total']}% of total spend.")

if not environment_cost.empty:
    top_env = environment_cost.iloc[0]
    print(f"4. Highest Cost Environment: {top_env['Environment']} accounting for {top_env['%_of_Total']}% of total spend.")