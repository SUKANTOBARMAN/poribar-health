from app.models.article import Article
from app.schemas.article import ArticleOut, ArticlePublicOut
from app.schemas.content import AlbumImageOut


def _author_institution(article: Article) -> str | None:
    profile = article.volunteer.volunteer_profile
    if profile and profile.institution:
        return profile.institution.name_bn
    return None


def _album_items(article: Article) -> list[AlbumImageOut]:
    return [
        AlbumImageOut(id=am.id, media_id=am.media_id, order_index=am.order_index, caption=am.caption, is_cover=am.is_cover)
        for am in sorted(article.album, key=lambda a: a.order_index)
    ]


def _cover_media_id(article: Article) -> int | None:
    return next((am.media_id for am in article.album if am.is_cover), None)


def to_article_out(article: Article) -> ArticleOut:
    return ArticleOut(
        id=article.id,
        volunteer_id=article.volunteer_id,
        help_request_id=article.help_request_id,
        title=article.title,
        body=article.body,
        patient_consent=article.patient_consent,
        patient_name_hidden=article.patient_name_hidden,
        status=article.status,
        reviewed_by=article.reviewed_by,
        review_note=article.review_note,
        published_at=article.published_at,
        created_at=article.created_at,
        tags=[t.tag for t in article.tags],
        category_id=article.category_id,
        category_name=article.category.name_bn if article.category else None,
        author_name=article.volunteer.name,
        author_institution=_author_institution(article),
        cover_media_id=_cover_media_id(article),
        album_items=_album_items(article),
        cover_caption=_cover_caption(article),
    )


def to_article_public_out(article: Article) -> ArticlePublicOut:
    return ArticlePublicOut(
        id=article.id,
        title=article.title,
        body=article.body,
        published_at=article.published_at,
        tags=[t.tag for t in article.tags],
        category_name=article.category.name_bn if article.category else None,
        author_name=article.volunteer.name,
        author_institution=_author_institution(article),
        cover_media_id=_cover_media_id(article),
        album_items=_album_items(article),
        cover_caption=_cover_caption(article),
    )
    
    
def _cover_caption(article: Article) -> str | None:
    cover = next((am for am in article.album if am.is_cover), None)
    return cover.caption if cover else None