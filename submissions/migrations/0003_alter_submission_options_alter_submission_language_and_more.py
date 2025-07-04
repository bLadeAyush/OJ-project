# Generated by Django 5.2.3 on 2025-06-26 06:40

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('problems', '0001_initial'),
        ('submissions', '0002_submission_error_submission_output'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='submission',
            options={'ordering': ['-submitted_at']},
        ),
        migrations.AlterField(
            model_name='submission',
            name='language',
            field=models.CharField(choices=[('python', 'Python'), ('cpp', 'C++'), ('java', 'Java')], max_length=20),
        ),
        migrations.AlterField(
            model_name='submission',
            name='problem',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='submissions', to='problems.problem'),
        ),
        migrations.AlterField(
            model_name='submission',
            name='submitted_at',
            field=models.DateTimeField(auto_now_add=True, db_index=True),
        ),
        migrations.AlterField(
            model_name='submission',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='submissions', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='submission',
            name='verdict',
            field=models.CharField(choices=[('PENDING', 'Pending'), ('AC', 'Accepted'), ('WA', 'Wrong Answer'), ('TLE', 'Time Limit Exceeded'), ('RE', 'Runtime Error'), ('CE', 'Compilation Error')], db_index=True, default='PENDING', max_length=10),
        ),
        migrations.AddIndex(
            model_name='submission',
            index=models.Index(fields=['user', 'problem'], name='submissions_user_id_1304bb_idx'),
        ),
    ]
