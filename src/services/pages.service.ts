import api from './api';

export interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getAllPages = async () => {
  const { data } = await api.get('/pages');
  return data.data;
};

export const getPageByIdOrSlug = async (slug: string) => {
  const { data } = await api.get(`/pages/${slug}`);
  return data.data;
};

export const createPage = async (pageData: any) => {
  const { data } = await api.post('/pages', pageData);
  return data.data;
};

export const updatePage = async (id: string, pageData: any) => {
  const { data } = await api.put(`/pages/${id}`, pageData);
  return data.data;
};

export const deletePage = async (id: string) => {
  const { data } = await api.delete(`/pages/${id}`);
  return data.data;
};
