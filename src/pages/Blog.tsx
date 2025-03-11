import { Calendar, User, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
}

export function Blog() {
  const featuredPosts: BlogPost[] = [
    {
      id: '1',
      title: 'Understanding Mortgage Rate Trends in 2024',
      excerpt: 'An in-depth analysis of current mortgage rate trends and predictions for the coming year.',
      author: 'Sarah Johnson',
      date: 'March 15, 2024',
      readTime: '8 min read',
      category: 'Market Analysis',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80'
    },
    {
      id: '2',
      title: 'How Technology is Transforming the Mortgage Industry',
      excerpt: 'Exploring the latest technological innovations reshaping mortgage lending and borrowing.',
      author: 'Michael Chen',
      date: 'March 10, 2024',
      readTime: '6 min read',
      category: 'Technology',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80'
    }
  ];

  const recentPosts: BlogPost[] = [
    {
      id: '3',
      title: 'Best Practices for Client Communication',
      excerpt: 'Learn effective strategies for maintaining strong relationships with mortgage clients.',
      author: 'Emily Rodriguez',
      date: 'March 5, 2024',
      readTime: '5 min read',
      category: 'Best Practices',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80'
    },
    {
      id: '4',
      title: 'The Impact of Fed Decisions on Mortgage Rates',
      excerpt: 'Understanding how Federal Reserve policies affect mortgage rates and the housing market.',
      author: 'David Thompson',
      date: 'March 1, 2024',
      readTime: '7 min read',
      category: 'Market Analysis',
      image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80'
    },
    {
      id: '5',
      title: 'Maximizing Efficiency with Rate Monitoring Tools',
      excerpt: 'Tips and strategies for getting the most out of your rate monitoring software.',
      author: 'Sarah Johnson',
      date: 'February 25, 2024',
      readTime: '4 min read',
      category: 'Technology',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80'
    }
  ];

  return (
    <MainLayout>
      <div className="bg-white">
        {/* Header */}
        <div className="relative bg-primary">
          <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Industry Insights & Updates
              </h1>
              <p className="mt-6 text-xl text-gray-100 max-w-3xl mx-auto">
                Stay informed with the latest trends, analysis, and best practices in mortgage rate monitoring.
              </p>
            </div>
          </div>
        </div>

        {/* Featured Posts */}
        <div className="max-w-7xl mx-auto pt-16 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Articles</h2>
          <div className="grid gap-8 lg:grid-cols-2">
            {featuredPosts.map((post) => (
              <div key={post.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
                <div className="flex-shrink-0">
                  <img className="h-48 w-full object-cover" src={post.image} alt="" />
                </div>
                <div className="flex flex-1 flex-col justify-between bg-white p-6">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary">
                      {post.category}
                    </p>
                    <Link to={`/blog/${post.id}`} className="mt-2 block">
                      <p className="text-xl font-semibold text-gray-900">{post.title}</p>
                      <p className="mt-3 text-base text-gray-500">{post.excerpt}</p>
                    </Link>
                  </div>
                  <div className="mt-6 flex items-center">
                    <div className="flex-shrink-0">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{post.author}</p>
                      <div className="flex space-x-1 text-sm text-gray-500">
                        <span>{post.date}</span>
                        <span aria-hidden="true">&middot;</span>
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Posts */}
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Recent Articles</h2>
          <div className="grid gap-8 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <div key={post.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
                <div className="flex-shrink-0">
                  <img className="h-48 w-full object-cover" src={post.image} alt="" />
                </div>
                <div className="flex flex-1 flex-col justify-between bg-white p-6">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary">
                      {post.category}
                    </p>
                    <Link to={`/blog/${post.id}`} className="mt-2 block">
                      <p className="text-xl font-semibold text-gray-900">{post.title}</p>
                      <p className="mt-3 text-base text-gray-500">{post.excerpt}</p>
                    </Link>
                  </div>
                  <div className="mt-6">
                    <div className="flex items-center">
                      <div className="flex space-x-4 text-sm text-gray-500">
                        <span className="inline-flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {post.date}
                        </span>
                        <span className="inline-flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {post.readTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gray-50">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
            <div className="px-6 py-6 bg-primary rounded-lg md:py-12 md:px-12 lg:py-16 lg:px-16 xl:flex xl:items-center">
              <div className="xl:w-0 xl:flex-1">
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Want mortgage industry news and updates?
                </h2>
                <p className="mt-3 max-w-3xl text-lg leading-6 text-gray-200">
                  Sign up for our newsletter to stay informed about the latest trends and insights.
                </p>
              </div>
              <div className="mt-8 sm:w-full sm:max-w-md xl:mt-0 xl:ml-8">
                <form className="sm:flex">
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email-address"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full rounded-lg border-white px-5 py-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
                    placeholder="Enter your email"
                  />
                  <button
                    type="submit"
                    className="mt-3 flex w-full items-center justify-center rounded-lg border border-transparent bg-white px-5 py-3 text-base font-medium text-primary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary sm:mt-0 sm:ml-3 sm:w-auto sm:flex-shrink-0"
                  >
                    Notify me
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </form>
                <p className="mt-3 text-sm text-gray-200">
                  We care about your data. Read our{' '}
                  <Link to="/privacy" className="font-medium text-white underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}