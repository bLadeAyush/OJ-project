# Generated by Django 5.2.3 on 2025-07-04 08:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('problems', '0004_remove_problem_hidden_input_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='problem',
            name='is_contest_only',
            field=models.BooleanField(default=False),
        ),
    ]
