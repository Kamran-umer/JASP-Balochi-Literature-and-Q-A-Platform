'use client'

import { ArrowBigDown, ArrowBigUp, MessageSquare, Share } from 'lucide-react'

// 1. THIS IS THE FIRST FIX
// 'profiles' is now an OBJECT, not an array of objects.
export type Post = {
  id: string;
  created_at: string;
  title: string | null;
  content: string; 
  profiles: {
    username: string;
  } | null; // Changed from '[] | null' to '| null'
};

type FeedItemProps = {
  post: Post;
};

export default function FeedItem({ post }: FeedItemProps) { 
  
  // 2. THIS IS THE MAIN FIX
  // We read 'post.profiles.username' directly (no [0]).
  const username = post.profiles?.username ?? 'Anonymous';
  const avatarLetter = username.charAt(0).toUpperCase();

  const postDate = new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4">
        {/* Author Info */}
        <div className="flex items-center space-x-2 mb-2 rtl:space-x-reverse">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-semibold">
            {avatarLetter}
          </div>
          <div>
            <span className="font-semibold text-sm">{username}</span>
            <span className="text-xs text-gray-500"> · {postDate}</span>
            <button className="ms-2 text-xs font-semibold text-blue-600 hover:underline">
              Follow
            </button>
          </div>
        </div>
        
        {/* Show Title if one was provided */}
        {post.title && (
          <h2 className="font-bold text-lg text-gray-800 hover:underline cursor-pointer">
            {post.title}
          </h2>
        )}

        {/* Show Content */}
        {/* Add 'mt-1' if a title exists, for spacing */}
        <p className={`text-gray-800 whitespace-pre-wrap py-2 ${post.title ? 'mt-1' : ''}`}>
          {post.content}
        </p>
      </div>

      {/* Action Bar (with placeholder stats) */}
      <div className="flex items-center justify-between p-2 border-t border-gray-100">
        <div className="flex items-center">
          <button className="flex items-center space-x-1 text-gray-600 hover:bg-gray-100 p-2 rounded-full rtl:space-x-reverse">
            <ArrowBigUp size={20} />
            <span className="text-sm font-medium">0</span>
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <ArrowBigDown size={20} className="text-gray-600" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <button className="flex items-center space-x-1.5 text-gray-600 hover:bg-gray-100 p-2 rounded-full rtl:space-x-reverse">
            <MessageSquare size={18} />
            <span className="text-sm">0</span>
          </button>
          <button className="flex items-center space-x-1.5 text-gray-600 hover:bg-gray-100 p-2 rounded-full rtl:space-x-reverse">
            <Share size={18} />
            <span className="text-sm">0</span>
          </button>
        </div>
      </div>
    </div>
  )
}
// 'use client'

// import { ArrowBigDown, ArrowBigUp, MessageSquare, Share } from 'lucide-react'

// // 1. This type is now for a 'Post'
// export type Post = {
//   id: string;
//   created_at: string;
//   content: string; // Changed from 'title'
//   profiles: {
//     username: string;
//   }[] | null; 
// };

// // 2. The prop is now 'post'
// type FeedItemProps = {
//   post: Post;
// };

// export default function FeedItem({ post }: FeedItemProps) { // 3. Use 'post'
  
//   const username = post.profiles?.[0]?.username ?? 'Anonymous';
//   const avatarLetter = username.charAt(0).toUpperCase();

//   const postDate = new Date(post.created_at).toLocaleDateString('en-US', {
//     month: 'short',
//     day: 'numeric'
//   });

//   return (
//     <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
//       <div className="p-4">
//         {/* Author Info */}
//         <div className="flex items-center space-x-2 mb-2 rtl:space-x-reverse">
//           <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-semibold">
//             {avatarLetter}
//           </div>
//           <div>
//             <span className="font-semibold text-sm">{username}</span>
//             <span className="text-xs text-gray-500"> · {postDate}</span>
//             <button className="ms-2 text-xs font-semibold text-blue-600 hover:underline">
//               Follow
//             </button>
//           </div>
//         </div>
        
//         {/* 4. Show the post 'content' */}
//         {/* We use 'whitespace-pre-wrap' to respect line breaks */}
//         <p className="text-gray-800 whitespace-pre-wrap py-2">
//           {post.content}
//         </p>
//       </div>

//       {/* Action Bar (with placeholder stats) */}
//       <div className="flex items-center justify-between p-2 border-t border-gray-100">
//         <div className="flex items-center">
//           <button className="flex items-center space-x-1 text-gray-600 hover:bg-gray-100 p-2 rounded-full rtl:space-x-reverse">
//             <ArrowBigUp size={20} />
//             <span className="text-sm font-medium">0</span>
//           </button>
//           <button className="p-2 rounded-full hover:bg-gray-100">
//             <ArrowBigDown size={20} className="text-gray-600" />
//           </button>
//         </div>
        
//         <div className="flex items-center space-x-2 rtl:space-x-reverse">
//           <button className="flex items-center space-x-1.5 text-gray-600 hover:bg-gray-100 p-2 rounded-full rtl:space-x-reverse">
//             <MessageSquare size={18} />
//             <span className="text-sm">0</span>
//           </button>
//           <button className="flex items-center space-x-1.5 text-gray-600 hover:bg-gray-100 p-2 rounded-full rtl:space-x-reverse">
//             <Share size={18} />
//             <span className="text-sm">0</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }