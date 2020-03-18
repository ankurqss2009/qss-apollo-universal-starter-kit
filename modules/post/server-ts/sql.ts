import { knex, returnId, orderedFor } from '@gqlapp/database-server-ts';

export interface Post {
  title: string;
  content: string;
}

export interface Comment {
  postId: number;
  content: string;
}

export interface Identifier {
  id: number;
}

export default class PostDAO {
  public postsPagination(limit: number, after: number) {
    return knex
      .select('id', 'title', 'content')
      .from('post')
      .orderBy('id', 'desc')
      .limit(limit)
      .offset(after);
  }

  public async getCommentsForPostIds(postIds: number[]) {
    const res = await knex
      .select('id', 'content', 'post_id AS postId')
      .from('comment')
      .whereIn('post_id', postIds);
    return orderedFor(res, postIds, 'postId', false);
  }

  public async getPicturesForPostIds(postIds: number[]) {
    const res = await knex
      .select('id', 'post_id AS postId', 'picture_id AS pictureId')
      .from('post_picture_map')
      .whereIn('post_id', postIds);
    return res;
  }

  public async addPicture(postId: number, pictureIds: number[]) {
    const fieldsToInsert = pictureIds.map(pictureId => ({ picture_id: pictureId, post_id: postId }));
    return returnId(knex('post_picture_map')).insert(fieldsToInsert);
  }

  public async deletePicture(postId: number) {
    return knex('post_picture_map')
      .where('post_id', '=', postId)
      .del();
  }

  public getTotal() {
    return knex('post')
      .countDistinct('id as count')
      .first();
  }

  public post(id: number) {
    return knex
      .select('id', 'title', 'content')
      .from('post')
      .where('id', '=', id)
      .first();
  }

  public addPost({ title, content }: Post) {
    return returnId(knex('post')).insert({ title, content });
  }

  public deletePost(id: number) {
    return knex('post')
      .where('id', '=', id)
      .del();
  }

  public editPost({ id, title, content }: Post & Identifier) {
    return knex('post')
      .where('id', '=', id)
      .update({ title, content });
  }

  public addComment({ content, postId }: Comment) {
    return returnId(knex('comment')).insert({ content, post_id: postId });
  }

  public getComment(id: number) {
    return knex
      .select('id', 'content')
      .from('comment')
      .where('id', '=', id)
      .first();
  }

  public deleteComment(id: number) {
    return knex('comment')
      .where('id', '=', id)
      .del();
  }

  public editComment({ id, content }: Comment & Identifier) {
    return knex('comment')
      .where('id', '=', id)
      .update({
        content
      });
  }
}
