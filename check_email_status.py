#!/usr/bin/env python3
"""
Quick script to check email sending status
"""
import os
import sys
sys.path.append('/mnt/c/Users/Sahil/Desktop/pingDaemon/backend')

from sqlalchemy import create_engine, text
from datetime import datetime, timedelta

def check_email_status():
    # Database connection
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://pingAdmin:Shockingstar15@postgres:5432/pingDaemon")
    engine = create_engine(DATABASE_URL)
    
    print("🔍 Email System Status Check")
    print("=" * 50)
    
    with engine.connect() as conn:
        # Check email queue status
        result = conn.execute(text("""
            SELECT 
                status, 
                COUNT(*) as count,
                MAX(created_at) as latest
            FROM email_queue 
            WHERE created_at > NOW() - INTERVAL '24 hours'
            GROUP BY status
            ORDER BY count DESC
        """))
        
        print("\n📧 Email Queue Status (Last 24h):")
        queue_has_data = False
        for row in result:
            queue_has_data = True
            print(f"  {row.status}: {row.count} emails (latest: {row.latest})")
        
        if not queue_has_data:
            print("  No queued emails found - likely using direct sending")
        
        # Check recent health checks
        result = conn.execute(text("""
            SELECT 
                COUNT(*) as total_checks,
                COUNT(CASE WHEN is_healthy = false THEN 1 END) as failed_checks
            FROM health_logs 
            WHERE checked_at > NOW() - INTERVAL '1 hour'
        """))
        
        for row in result:
            print(f"\n🏥 Health Checks (Last 1h):")
            print(f"  Total: {row.total_checks}")
            print(f"  Failed: {row.failed_checks}")
        
        # Check for status changes
        result = conn.execute(text("""
            SELECT 
                j.url,
                j.current_status,
                j.previous_status,
                j.updated_at
            FROM jobs j
            WHERE j.previous_status != j.current_status 
            AND j.updated_at > NOW() - INTERVAL '1 hour'
            ORDER BY j.updated_at DESC
        """))
        
        print(f"\n📊 Recent Status Changes (Last 1h):")
        changes_found = False
        for row in result:
            changes_found = True
            print(f"  {row.url}: {row.previous_status} → {row.current_status} at {row.updated_at}")
        
        if not changes_found:
            print("  No status changes detected")

if __name__ == "__main__":
    check_email_status()