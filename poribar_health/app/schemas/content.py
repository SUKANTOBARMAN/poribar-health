from pydantic import BaseModel


class CategoryCreate(BaseModel):
    name_bn: str
    name_en: str
    parent_id: int | None = None


class CategoryUpdate(BaseModel):
    name_bn: str | None = None
    name_en: str | None = None
    parent_id: int | None = None


class CategoryOut(BaseModel):
    id: int
    name_bn: str
    name_en: str
    parent_id: int | None

    model_config = {"from_attributes": True}


class MediaFileOut(BaseModel):
    id: int
    content_type: str

    model_config = {"from_attributes": True}


class AlbumImageOut(BaseModel):
    id: int
    media_id: int
    order_index: int
    caption: str | None
    is_cover: bool

    model_config = {"from_attributes": True}
    
class AlbumItemInput(BaseModel):
    media_id: int
    caption: str | None = None
    is_cover: bool = False