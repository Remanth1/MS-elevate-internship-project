import matplotlib.pyplot as plt
import seaborn as sns

# Set plot style
sns.set_style('whitegrid')

# 1. Monthly Cost Trend
plt.figure(figsize=(10, 6))
sns.lineplot(data=monthly_cost_trend, x='Month', y='Cost', marker='o')
plt.title('Monthly Cloud Cost Trend')
plt.xlabel('Month')
plt.ylabel('Total Cost')
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()

# 2. Total Cost by Service
service_cost_sorted = service_cost.sort_values(by='Cost', ascending=False)
plt.figure(figsize=(10, 6))
sns.barplot(data=service_cost_sorted, x='Service', y='Cost', palette='viridis')
plt.title('Total Cost by Service')
plt.xlabel('Service')
plt.ylabel('Total Cost')
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()

# 3. Total Cost by Instance Type
instance_type_cost_sorted = instance_type_cost.sort_values(by='Cost', ascending=False)
plt.figure(figsize=(10, 6))
sns.barplot(data=instance_type_cost_sorted, x='Instance_Type', y='Cost', palette='magma')
plt.title('Total Cost by Instance Type')
plt.xlabel('Instance Type')
plt.ylabel('Total Cost')
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()

# 4. Total Cost by Environment
environment_cost_sorted = environment_cost.sort_values(by='Cost', ascending=False)
plt.figure(figsize=(10, 6))
sns.barplot(data=environment_cost_sorted, x='Environment', y='Cost', palette='cividis')
plt.title('Total Cost by Environment')
plt.xlabel('Environment')
plt.ylabel('Total Cost')
plt.tight_layout()
plt.show()