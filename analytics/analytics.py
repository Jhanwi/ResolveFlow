import os

import pandas as pd
import psycopg2
import matplotlib.pyplot as plt
from dotenv import load_dotenv


load_dotenv()


def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )


def load_tickets(connection):
    query = """
        SELECT
            t.id,
            t.subject,
            t.category,
            t.priority,
            t.status,
            t.created_at,
            t.updated_at,
            t.response_due_at,
            t.resolution_due_at,
            customer.name AS customer_name,
            agent.name AS agent_name
        FROM tickets t
        JOIN users customer
            ON t.customer_id = customer.id
        LEFT JOIN users agent
            ON t.assigned_agent_id = agent.id
        ORDER BY t.created_at
    """

    return pd.read_sql(query, connection)


def load_reviews(connection):
    query = """
        SELECT
            r.id,
            r.ticket_id,
            r.customer_id,
            r.rating,
            r.comment,
            r.created_at
        FROM reviews r
        ORDER BY r.created_at
    """

    return pd.read_sql(query, connection)


def create_ticket_summary(tickets):
    total_tickets = len(tickets)

    resolved_tickets = len(
        tickets[tickets["status"] == "resolved"]
    )

    open_tickets = total_tickets - resolved_tickets

    summary = pd.DataFrame([
        {
            "metric": "Total Tickets",
            "value": total_tickets
        },
        {
            "metric": "Open Tickets",
            "value": open_tickets
        },
        {
            "metric": "Resolved Tickets",
            "value": resolved_tickets
        }
    ])

    return summary


def create_priority_report(tickets):
    report = (
        tickets["priority"]
        .fillna("unknown")
        .value_counts()
        .rename_axis("priority")
        .reset_index(name="ticket_count")
    )

    return report


def create_category_report(tickets):
    report = (
        tickets["category"]
        .fillna("Uncategorized")
        .value_counts()
        .rename_axis("category")
        .reset_index(name="ticket_count")
    )

    return report


def create_daily_report(tickets):
    if tickets.empty:
        return pd.DataFrame(
            columns=["date", "ticket_count"]
        )

    tickets["created_at"] = pd.to_datetime(
        tickets["created_at"]
    )

    report = (
        tickets
        .assign(
            date=tickets["created_at"].dt.date
        )
        .groupby("date")
        .size()
        .reset_index(name="ticket_count")
    )

    return report


def create_agent_report(tickets):
    assigned = tickets.copy()

    assigned["agent_name"] = (
        assigned["agent_name"]
        .fillna("Unassigned")
    )

    report = (
        assigned["agent_name"]
        .value_counts()
        .rename_axis("agent_name")
        .reset_index(name="ticket_count")
    )

    return report


def create_sla_report(tickets):
    if tickets.empty:
        return pd.DataFrame(
            columns=[
                "ticket_id",
                "priority",
                "status",
                "response_sla",
                "resolution_sla"
            ]
        )

    current_time = pd.Timestamp.now()

    tickets["response_due_at"] = pd.to_datetime(
        tickets["response_due_at"]
    )

    tickets["resolution_due_at"] = pd.to_datetime(
        tickets["resolution_due_at"]
    )

    report = tickets[
        [
            "id",
            "priority",
            "status",
            "response_due_at",
            "resolution_due_at"
        ]
    ].copy()

    report["response_sla"] = report[
        "response_due_at"
    ].apply(
        lambda value:
        "No SLA"
        if pd.isna(value)
        else (
            "Within SLA"
            if value >= current_time
            else "Breached"
        )
    )

    report["resolution_sla"] = report[
        "resolution_due_at"
    ].apply(
        lambda value:
        "No SLA"
        if pd.isna(value)
        else (
            "Within SLA"
            if value >= current_time
            else "Breached"
        )
    )

    report = report.rename(
        columns={"id": "ticket_id"}
    )

    return report[
        [
            "ticket_id",
            "priority",
            "status",
            "response_sla",
            "resolution_sla"
        ]
    ]


def create_review_report(reviews):
    if reviews.empty:
        return pd.DataFrame([
            {
                "review_count": 0,
                "average_rating": 0
            }
        ])

    return pd.DataFrame([
        {
            "review_count": len(reviews),
            "average_rating": round(
                reviews["rating"].mean(),
                2
            )
        }
    ])


def create_volume_chart(daily_report):
    if daily_report.empty:
        return

    plt.figure(figsize=(9, 5))

    plt.plot(
        daily_report["date"],
        daily_report["ticket_count"],
        marker="o"
    )

    plt.title(
        "ResolveFlow Ticket Volume"
    )

    plt.xlabel("Date")
    plt.ylabel("Tickets")

    plt.xticks(rotation=45)

    plt.tight_layout()

    plt.savefig(
        "output/ticket_volume.png"
    )

    plt.close()


def save_reports(
    summary,
    priority_report,
    category_report,
    daily_report,
    agent_report,
    sla_report,
    review_report
):
    summary.to_csv(
        "output/ticket_summary.csv",
        index=False
    )

    priority_report.to_csv(
        "output/priority_report.csv",
        index=False
    )

    category_report.to_csv(
        "output/category_report.csv",
        index=False
    )

    daily_report.to_csv(
        "output/daily_ticket_volume.csv",
        index=False
    )

    agent_report.to_csv(
        "output/agent_workload.csv",
        index=False
    )

    sla_report.to_csv(
        "output/sla_report.csv",
        index=False
    )

    review_report.to_csv(
        "output/customer_reviews.csv",
        index=False
    )


def main():
    print("Starting ResolveFlow analytics...")

    connection = None

    try:
        connection = get_connection()

        tickets = load_tickets(
            connection
        )

        reviews = load_reviews(
            connection
        )

        print(
            f"Loaded {len(tickets)} tickets."
        )

        summary = create_ticket_summary(
            tickets
        )

        priority_report = create_priority_report(
            tickets
        )

        category_report = create_category_report(
            tickets
        )

        daily_report = create_daily_report(
            tickets
        )

        agent_report = create_agent_report(
            tickets
        )

        sla_report = create_sla_report(
            tickets
        )

        review_report = create_review_report(
            reviews
        )

        save_reports(
            summary,
            priority_report,
            category_report,
            daily_report,
            agent_report,
            sla_report,
            review_report
        )

        create_volume_chart(
            daily_report
        )

        print(
            "Analytics reports created successfully."
        )

        print("\nTicket Summary:")
        print(summary.to_string(index=False))

        print("\nPriority Report:")
        print(
            priority_report.to_string(
                index=False
            )
        )

        print("\nCategory Report:")
        print(
            category_report.to_string(
                index=False
            )
        )

        print("\nCustomer Reviews:")
        print(
            review_report.to_string(
                index=False
            )
        )

    except Exception as error:
        print(
            f"Analytics failed: {error}"
        )

    finally:
        if connection:
            connection.close()


if __name__ == "__main__":
    main()