import random
import csv
from faker import Faker
from datetime import datetime, timedelta

fake = Faker()

departments = ['Engineering', 'Sales', 'HR', 'Marketing', 'Finance', 'Support', 'Operations']

with open('sample_employees.csv', mode='w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(['id', 'name', 'department', 'salary', 'joining_date'])

    for i in range(1, 1001):
        name = fake.name()
        department = random.choice(departments)
        salary = random.randint(40000, 150000)
        joining_date = fake.date_between(start_date='-10y', end_date='today').strftime('%Y-%m-%d')

        writer.writerow([i, name, department, salary, joining_date])
