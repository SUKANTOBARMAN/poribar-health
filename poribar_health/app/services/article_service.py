from app.models.article import Article
from app.schemas.article import ArticleOut, ArticlePublicOut


def to_article_out(article: Article) -> ArticleOut:
    return ArticleOut(
        id=article.id,
        volunteer_id=article.volunteer_id,
        help_request_id=article.help_request_id,
        title=article.title,
        body=article.body,
        type=article.type,
        patient_consent=article.patient_consent,
        patient_name_hidden=article.patient_name_hidden,
        status=article.status,
        reviewed_by=article.reviewed_by,
        review_note=article.review_note,
        published_at=article.published_at,
        created_at=article.created_at,
        tags=[t.tag for t in article.tags],
    )


def to_article_public_out(article: Article) -> ArticlePublicOut:
    return ArticlePublicOut(
        id=article.id,
        title=article.title,
        body=article.body,
        type=article.type,
        published_at=article.published_at,
        tags=[t.tag for t in article.tags],
    )