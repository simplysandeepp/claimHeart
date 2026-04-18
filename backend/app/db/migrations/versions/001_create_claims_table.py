"""create claims support tables

Revision ID: 001_create_claims_table
Revises: 20260418_0001
Create Date: 2026-04-19
"""

from alembic import op
import sqlalchemy as sa


revision = "001_create_claims_table"
down_revision = "20260418_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "claim_timeline",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("claim_id", sa.Integer(), sa.ForeignKey("claims.id", ondelete="CASCADE"), nullable=False),
        sa.Column("stage", sa.String(length=64), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("actor_id", sa.Integer(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("timestamp", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_claim_timeline_claim_id", "claim_timeline", ["claim_id"], unique=False)

    op.create_table(
        "claim_documents",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("claim_id", sa.Integer(), sa.ForeignKey("claims.id", ondelete="CASCADE"), nullable=False),
        sa.Column("document_type", sa.String(length=64), nullable=False),
        sa.Column("file_path", sa.String(length=512), nullable=False),
        sa.Column("uploaded_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_claim_documents_claim_id", "claim_documents", ["claim_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_claim_documents_claim_id", table_name="claim_documents")
    op.drop_table("claim_documents")

    op.drop_index("ix_claim_timeline_claim_id", table_name="claim_timeline")
    op.drop_table("claim_timeline")
